async function test() {
  const res = await fetch("http://localhost:3000/api/rss-proxy?url=https://www.thehindu.com/news/national/feeder/default.rss");
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text.substring(0, 200));
}
test();
