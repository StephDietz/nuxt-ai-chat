export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig();
	const previousMessages = await readBody(event);

	const req = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${config.OPENAI_API_KEY}`
		},
		body: JSON.stringify({
			model: 'gpt-3.5-turbo',
			messages: previousMessages,
			temperature: 0.9,
			max_tokens: 512
		})
	});

	const res = await req.json();
	const result = res.choices[0];
	return {
		message: result.message
	};
});
