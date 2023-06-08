const resolveStream = async ({ onChunk = () => {}, onReady = () => {}, stream }) => {
	const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
	let data = '';

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		const chunks = value
			.replace(/^data: /gm, '')
			.split('\n')
			.filter((c) => Boolean(c.length) && c !== '[DONE]');

		chunks.forEach((chunk) => {
			try {
				const parsedChunk = JSON.parse(chunk);
				const content = parsedChunk.choices[0].text;
				if (content) {
					data += content;
					onChunk({ data: content });
				}
			} catch (error) {
				console.error('Error parsing JSON:', error);
				console.log('Problematic chunk:', chunk);
			}
		});
	}

	onReady({ data });
};

export const useChatStream = ({ onChunk = () => {}, onReady = () => {}, stream }) => {
	resolveStream({ onChunk, onReady, stream });
};
