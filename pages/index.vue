<script setup>
	const messages = ref([]);
	const answer = ref(null);

	const question = ref('');

	const getAnswer = async ({ messages }) => {
		const { body } = await fetch('/api/chat', {
			method: 'POST',
			body: JSON.stringify({
				messages
			})
		});
		if (!body) throw new Error('Unknown error');

		return body;
	};
	const askQuestion = async () => {
		messages.value.push({
			role: 'user',
			content: question.value
		});
		question.value = '';
		const stream = await getAnswer({ messages: messages.value });
		answer.value = {
			role: 'assistant',
			content: ''
		};
		useChatStream({
			stream,
			onChunk: ({ data }) => {
				answer.value.content += data;
			},
			onReady: () => {
				messages.value.push(answer.value);
				answer.value = null;
			}
		});
	};
</script>

<template>
	<div class="mb-8 text-4xl font-bold text-center">AI Chatbot</div>
	<div class="max-w-xl mx-auto">
		<div class="bg-white rounded-md shadow h-[80vh] flex flex-col justify-between">
			<ul class="overflow-auto">
				<li v-for="message in messages" class="flex flex-col p-4">
					<div v-if="message.role === 'assistant'" class="pr-8 mr-auto">
						<div class="p-2 mt-1 text-sm text-gray-700 bg-gray-200 rounded-lg text-smp-2">
							{{ message.content }}
						</div>
					</div>
					<div v-else class="pl-8 ml-auto">
						<div class="p-2 mt-1 text-sm text-white bg-blue-400 rounded-lg">
							{{ message.content }}
						</div>
					</div>
				</li>
				<!-- Incoming message -->
				<li v-if="answer" class="flex p-4">
					<div class="pr-8">
						<div class="p-2 mt-1 text-sm text-gray-700 bg-gray-200 rounded-lg text-smp-2">
							{{ answer.content }}
						</div>
					</div>
				</li>
			</ul>
			<form @submit.prevent="askQuestion">
				<div class="flex items-center w-full p-4">
					<input
						v-model="question"
						type="text"
						placeholder="Type here..."
						class="w-full p-1 text-sm text-black bg-transparent bg-gray-100 border rounded-md shadow border-white/40 grow"
					/>
					<button
						type="submit"
						class="flex items-center justify-center flex-none w-10 h-10 ml-2 bg-green-500 rounded-full"
					>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M22 2L11 13"
								stroke="white"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
							<path
								d="M22 2L15 22L11 13L2 9L22 2Z"
								stroke="white"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</button>
				</div>
			</form>
		</div>
	</div>
</template>
