import { OpenAIApi, Configuration } from 'openai';

const config = useRuntimeConfig();

const configuration = new Configuration({
	apiKey: config.openAi.secretKey
});
const openai = new OpenAIApi(configuration);

const getChatStream = async ({ messages }) => {
	try {
		const response = await openai.createChatCompletion(
			{
				max_tokens: 2048,
				model: 'gpt-4',
				temperature: 0.5,
				messages,
				stream: true
			},
			{ responseType: 'stream' }
		);

		return response.data;
	} catch (error) {
		console.error('Error during chat completion:', error);
		throw error;
	}
};

export default defineEventHandler(async (event) => {
	try {
		const { messages } = await readBody(event);
		const stream = await getChatStream({ messages });

		return sendStream(event, stream);
	} catch (error) {
		console.error('Error during event handling:', error);
		return sendError(event, 500, error.message || 'Internal Server Error');
	}
});
