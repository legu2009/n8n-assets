import { Hono } from 'hono'
import {
  getCookie,
  getSignedCookie,
  setCookie,
  setSignedCookie,
  deleteCookie,
} from 'hono/cookie'
import { R2Bucket, } from '@cloudflare/workers-types'

type Bindings = {
  MY_BUCKET: R2Bucket,
  N8N_HOST: string
}
const app = new Hono<{ Bindings: Bindings }>();

async function redirectToHtml(c) {
  const res = await fetch(new URL('/rest/sentry.js', c.env.N8N_HOST).toString());
  const data = await res.text();
  let n8nVersion = data.match(/n8n@(\d+\.\d+\.\d+)/)?.[1] ?? '';
  if (!['1.98.2'].includes(n8nVersion)) {
    return c.text(`n8n version: ${n8nVersion} not support`, 404);
  }
  //@ts-ignore
  return c.env.ASSETS.fetch(new URL(`/static/${n8nVersion}/index.html`, c.req.url).toString());
}

async function proxyAjax(c) {
  const dirctUrl = new URL(c.req.path, c.env.N8N_HOST);
  const headers = new Headers(c.req.raw.headers);
  headers.set('host', dirctUrl.host);
  headers.set('origin', dirctUrl.origin);
  try {
    headers.set('referer', new URL(new URL(headers.get('referer') || '').pathname, c.env.N8N_HOST).toString());
  } catch (e) {
    console.log(e);
  }
  return fetch(dirctUrl.toString(), {
    method: c.req.method,
    headers,
    body: c.req.raw.body
  })
  if (!c.req.path.startsWith('/rest/login')) {
    return fetchAjax
  }
  let response = await fetchAjax;
  let resHeaders = new Headers(response.headers);
  resHeaders.delete('content-length');
  resHeaders.delete('transfer-encoding');
  resHeaders.delete('content-encoding');
  resHeaders.set('Set-Cookie', resHeaders.get('Set-Cookie')?.replace('HttpOnly; Secure; SameSite=Lax', '') || '');
  return new Response(await response.bytes(), {
    headers: resHeaders
  });

}

app.all('/rest/*', proxyAjax);
app.all('/types/*', proxyAjax);
//Set-Cookie: n8n-auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM2MjE3OWFhLTlmMjAtNGNlZC04MjAwLTZkNTk4NWI0Njk5NyIsImhhc2giOiJzU0JlT1krYk8wIiwiYnJvd3NlcklkIjoiN1VFZGVBdmFzRHFEbmFsM2szVkNYTmk3Z1JZTU10bk52VCtidUc0a1F1VT0iLCJpYXQiOjE3NTA2NTYxMzIsImV4cCI6MTc1MTI2MDkzMn0.AFb4BycgcHynEWsM6udFhHpRdZAtxgjPXCbJEJZWE3Y; Max-Age=604800; Path=/; Expires=Mon, 30 Jun 2025 05:22:12 GMT; HttpOnly; Secure; SameSite=Lax

app.notFound(redirectToHtml)

export default app
