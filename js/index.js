const puppeteer = require("puppeteer");

const downloadMP3 = async (songLink) => {
  const browser = await puppeteer.launch({
    headless: false,
    openInExistingWindow: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 0, height: 0 });

  await page.goto(songLink, {
    waitUntil: "networkidle2",
  });

  await page.waitForTimeout(3000);

  return await page.evaluate(() => {
    document.querySelector("#formatSelect").value = "128";
    document.querySelector("#btn-action").click();
    setTimeout(() => {
      document.querySelector("#asuccess").click();
    }, 7000);
  });
};

const getYTLink = async (songName, index) => {
  try {
    const url = `https://www.youtube.com/results?search_query=${songName}`;
    const browser = await puppeteer.launch({
      headless: false,
      openInExistingWindow: true,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 0, height: 0 });

    await page.goto(url, {
      waitUntil: "networkidle2",
    });

    await page.waitForTimeout(5000);

    let link = await page.evaluate(() => {
      return document.querySelector(
        ".yt-simple-endpoint.style-scope.ytd-video-renderer"
      ).href;
    });
    await browser.close();
    await downloadMP3(link.replace("youtube.com", "youtube5s.com"));
    console.log("Getting link for " + link + " " + index);
    await page.waitForTimeout(5000);
    return link;
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    openInExistingWindow: true,
  });

  const page = await browser.newPage();

  const playlist_url =
    "https://open.spotify.com/playlist/4RDrmTNCs7KTcsDUX1j6ap";

  await page.setViewport({ width: 0, height: 0 });

  await page.goto(playlist_url);

  await page.waitForTimeout(5000);

  let queries = await page.evaluate(() => {
    const array = document.querySelectorAll(".fCtMzo");
    const array2 = Array.from(
      document.querySelectorAll(".rq2VQ5mb9SDAFWbBIUIn")
    );
    console.log(array2, array);
    let ytSearchQueries = Array.from(array).map(
      (elm, index) => `${elm.innerHTML} ${array2[index].innerText} song`
    );

    return ytSearchQueries;
  });
  let ytLinks = [];
  for (let i = 0; i < queries.length; i++) {
    // replace i with the latest logged index to resume from there
    const name = queries[i];
    ytLinks.push(await getYTLink(name, i));
  }

  console.log(ytLinks);
})();
