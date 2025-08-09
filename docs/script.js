const sitename = "KOLEV.SITE";
const siteNameContainer = document.getElementById('site-link');

const redrawSiteName = () => {
  siteNameContainer.innerHTML = '';
  for(const char of sitename) {
    const el = document.createElement('div');
    const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    el.innerText = char;
    el.style.color = randomHex;
    siteNameContainer.appendChild(el);
  }
}

setInterval(redrawSiteName, 1000)
redrawSiteName();
