import { getChatStream } from '../utils/ai';

export default defineEventHandler(async (event) => {
	const { messages } = await readBody(event);
	const stream = await getChatStream({ messages });

	return sendStream(event, stream);
});
