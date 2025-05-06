// 使用auto适配器，并指定Node.js目标版本
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// 指定适配器和Node.js版本
		adapter: adapter({
			// 明确指定目标为Node.js 16.x
			target: 'node16'
		}),

		// Override http methods in the Todo forms
		methodOverride: {
			allowed: ['PATCH', 'DELETE']
		}
	}
};

export default config;
