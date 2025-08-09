import { NextResponse } from 'next/server';

const BASE_PROMPT = `Generate a detailed HTML product description for a WooCommerce product page. The product is a high-end designer mirror. The content should include:

1. Product Overview – a paragraph highlighting the product’s design, functionality, and materials.
2. Key Features – a bullet list of key product features such as materials, mounting options, and safety enhancements.
3. Additional Information – covering design details, usability, maintenance, and safety features.
4. Specifications Table – presented in an HTML <table>, listing dimensions, glass thickness, weight, finish options, and warranty.
5. Guarantee – a short paragraph on warranty and customer support.
6. Included Items – a bullet list of items included in the box.
7. About the Brand – a final paragraph describing the brand’s identity, craftsmanship, and design philosophy.

add numbers to the headings. 
For each of the above points use an H1 or H2 tag for headings, and ensure the content is structured with appropriate HTML tags.

Following are the details about the product:
Title: {title}
Raw Info: {raw_info}
Brand: {brand}

Structure the output using semantic HTML, using appropriate tags like <p>, <ul>, <li>, <table>, <thead>, <tbody>, and <strong> where needed. Do not include any styling (no inline CSS). Only return the raw HTML content, no extra explanations.`;

export async function POST(req: Request) {
  try {
    const { title = '', raw_info = '', brand = '' } = await req.json();

    if (!title || !raw_info || !brand) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const filledPrompt = BASE_PROMPT
      .replace('{title}', title)
      .replace('{raw_info}', raw_info)
      .replace('{brand}', brand);

    const apiKey = process.env.OPENROUTER_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OPENROUTER_KEY' }, { status: 500 });
    }

    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost', // optional metadata
        'X-Title': 'Description Generator'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert e-commerce copywriter producing clean HTML only.' },
          { role: 'user', content: filledPrompt }
        ],
        temperature: 0.7
      })
    });

    if (!r.ok) {
      const text = await r.text();
      return NextResponse.json({ error: 'OpenRouter error', detail: text }, { status: 502 });
    }

    const data = await r.json();
    let html = data?.choices?.[0]?.message?.content || '';

    // Strip code fences if model wrapped output
    html = html.trim();
    if (html.startsWith('```')) {
      html = html.replace(/^```(?:html)?/i, '').replace(/```$/, '').trim();
    }

    return NextResponse.json({ html });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: 'Server error', detail: message }, { status: 500 });
  }
}
