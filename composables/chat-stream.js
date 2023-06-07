const resolveStream = async ({ data, onChunk = () => {}, onReady = () => {}, stream }) => {
	const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		const chunks = value
			.replace(/^data: /gm, '')
			.split('\n')
			.filter((c) => Boolean(c.length) && c !== '[DONE]')
			.map((c) => JSON.parse(c));

		for (let chunk of chunks) {
			const content = chunk.choices[0].delta.content;
			if (!content) continue;
			data.value += chunk.choices[0].delta.content;
			onChunk({ data: content });
		}
	}

	onReady({ data: data.value });
};

export const useChatStream = ({ onChunk = () => {}, onReady = () => {}, stream }) => {
	const data = ref('');

	resolveStream({
		data,
		onChunk,
		onReady,
		stream
	});

	return {
		data: readonly(data)
	};
};
