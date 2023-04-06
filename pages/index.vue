<template>
	<div>
		<h1 class="mb-8 text-5xl font-bold text-center">
			Summarize a reddit thread in seconds with Open Ai!
		</h1>
		<label for="searchInput">Search:</label>
		<input class="text-black" id="searchInput" type="text" v-model="searchTerm" />
		<button @click="search">Search</button>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				searchTerm: ''
			};
		},
		methods: {
			async search() {
				const response = await fetch('/api/open-ai-stream', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						searched: this.searchTerm
					})
				});

				const reader = response.body.getReader();
				const decoder = new TextDecoder();
				let done = false;
				console.log(reader);
				let x = '';
				while (!done) {
					const { value, done: doneReading } = await reader.read();
					done = doneReading;
					const chunkValue = decoder.decode(value);
					console.log({ chunkValue, doneReading });

					if (chunkValue) {
						x += chunkValue;
					}
				}

				console.log({ x });
			}
		}
	};
</script>
