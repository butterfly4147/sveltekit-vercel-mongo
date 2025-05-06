<script context="module">
//export const prerender = true;

  export async function load({ params, fetch, session, stuff }) {
    try {
      const res = await fetch('/apothegm', {
        method: "GET",
        headers: { 'content-type': 'application/json' }
      });
      
      if (!res.ok) {
        console.error('API请求失败:', res.status);
        return {
          props: {
            apothegms: { apos: [], error: `API请求失败: ${res.status}` }
          }
        };
      }
      
      const data = await res.json();
      return {
        props: {
          apothegms: data
        }
      };
    } catch (error) {
      console.error('加载数据时出错:', error);
      return {
        props: {
          apothegms: { apos: [], error: error.message }
        }
      };
    }
  }

</script>

<script>
import Counter from '$lib/Counter.svelte';

export let apothegms;

async function onSubmit(e) {
  const formData = new FormData(e.target);

  const data = {};
  for (let field of formData) {
    const [key, value] = field;
    data[key] = value;
  }
  console.log("formData: " + formData);

  const res = await fetch('/apothegm', {
    method: 'POST',
    body: JSON.stringify(data)
  })
	
  const json = await res.json();
  //result = JSON.stringify(json.apos);
  console.log("json::: " + JSON.stringify(json));
  getApothegms();
}
async function getApothegms() {
  const res = await fetch('/apothegm', {
    method: 'GET'
  });
  const json = await res.json();
  console.log("res:" + json); 
  apothegms = json;
//  return cats;
}
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<section>
  <h1>
    <div class="welcome">
      <picture>
        <source srcset="svelte-welcome.webp" type="image/webp" />
        <img src="svelte-welcome.png" alt="Welcome" />
      </picture>
    </div>
    to your new<br />SvelteKit app FOOBAR
  </h1>
  <form on:submit|preventDefault={onSubmit}>
    <label for="apothegm">Apothegm</label>
    <input type="text" name="apothegm" id="apothegm"/>
    <label for="author">Author</label>
    <input type="text" name="author" id="author"/>
    <button type="submit">Submit</button>
  </form>

<div>
  {#if apothegms.error}
    <div class="error">
      <p>错误: {apothegms.error}</p>
    </div>
  {/if}
  
  {#if apothegms.apos && apothegms.apos.length > 0}
    <ul>
      {#each apothegms.apos as apo}
        <li>
          {apo.apothegm} - <em>{apo.author || '匿名'}</em>
        </li>
      {/each}
    </ul>
  {:else}
    <p>暂无数据</p>
  {/if}
</div>

	<h2>
		try editing <strong>src/routes/index.svelte</strong>
	</h2>

	<Counter />
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
