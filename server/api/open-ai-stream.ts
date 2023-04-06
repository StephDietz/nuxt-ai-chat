import { createParser } from 'eventsource-parser';
// import { OPENAI_API_KEY } from '$env/static/private';
import { sendStream } from 'h3';

const key = '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';

interface OpenAIStreamPayload {
	model: string;
	prompt: string;
	temperature: number;
	top_p: number;
	frequency_penalty: number;
	presence_penalty: number;
	max_tokens: number;
	stream: boolean;
	n: number;
}

async function OpenAIStream(payload: OpenAIStreamPayload) {
	const encoder = new TextEncoder();
	const decoder = new TextDecoder();

	let counter = 0;

	const res = await fetch('https://api.openai.com/v1/chat/completions', {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${key ?? ''}`
		},
		method: 'POST',
		body: JSON.stringify(payload)
	});

	const stream = new ReadableStream({
		async start(controller) {
			// callback
			function onParse(event) {
				if (event.type === 'event') {
					const data = event.data;
					// https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
					if (data === '[DONE]') {
						controller.close();
						return;
					}
					try {
						const json = JSON.parse(data);
						const text = json.choices[0].delta?.content || '';
						// if (counter < 2 && (text.match(/\n/) || []).length) {
						// 	// this is a prefix character (i.e., "\n\n"), do nothing
						// 	return;
						// }
						console.log(text);
						const queue = encoder.encode(text);
						controller.enqueue(queue);
						// counter++;
					} catch (e) {
						// maybe parse error
						controller.error(e);
					}
				}
			}

			// stream response (SSE) from OpenAI may be fragmented into multiple chunks
			// this ensures we properly read chunks and invoke an event for each SSE event stream
			const parser = createParser(onParse);
			// https://web.dev/streams/#asynchronous-iteration
			for await (const chunk of res.body as any) {
				parser.feed(decoder.decode(chunk));
			}
		}
	});

	return stream;
}
export default defineEventHandler(async (event) => {
	const { searched } = await readBody(event);
	// console.log(event.res);
	const payload = {
		model: 'text-davinci-003',
		prompt: searched,
		temperature: 0.7,
		max_tokens: 2048,
		top_p: 1.0,
		frequency_penalty: 0.0,
		stream: true,
		presence_penalty: 0.0,
		n: 1
	};

	setResponseStatus(400);
	setResponseHeader(event, 'content-encoding', 'br');
	setResponseHeader(event, 'content-type', 'text/event-stream');
	const stream = await OpenAIStream(payload);
	// return stream;
	// sendStream(event.res, stream);

	// return OpenAIStream(payload);

	return new Response(stream, { headers: { 'Content-Type': 'text' } });

	// return sendStream(event, stream);

	// return stream;
	// console.log(new Response(stream));
	// return new Response(stream);
});
