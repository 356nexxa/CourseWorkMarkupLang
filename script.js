(function () {
  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function textContent(el, name) {
    var node = el.getElementsByTagName(name)[0];
    return node ? node.textContent.trim() : "";
  }

  function initMobileMenu() {
    var toggle = qs(".menu-toggle");
    var menu = qs(".mobile-menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("active");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    qsa(".mobile-nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("active");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

 function renderNewsFromXml() {
    var root = qs("[data-news-app]");
    if (!root) return;

    var idParam = getParam("id");
    var articleEl = qs("[data-news-article]");
    var titleEl = qs("[data-news-title]");
    var catEl = qs("[data-news-category]");
    var dateEl = qs("[data-news-date]");
    var imgEl = qs("[data-news-image]");
    var bodyEl = qs("[data-news-body]");
    var asideEl = qs("[data-news-aside]");

    console.log("idParam:", idParam);
    console.log("Elements found:", !!titleEl, !!catEl, !!dateEl, !!imgEl, !!bodyEl, !!asideEl);

    if (!idParam || !articleEl || !titleEl || !catEl || !dateEl || !imgEl || !bodyEl || !asideEl) {
      console.error("Missing elements on page");
      return;
    }

    fetch("news.xml")
      .then(function (res) {
        if (!res.ok) throw new Error("Не удалось загрузить news.xml");
        return res.text();
      })
      .then(function (xmlText) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(xmlText, "application/xml");
        var parseErr = qs("parsererror", doc);
        if (parseErr) throw new Error("Ошибка разбора XML");

        var items = qsa("item", doc);
        console.log("Total items:", items.length);
        var match = null;
        items.forEach(function (item) {
          if (item.getAttribute("id") === idParam) match = item;
        });
        console.log("Match found:", !!match);

        if (!match) {
          articleEl.innerHTML = '<p class="news-error">Новость не найдена</p>';
          asideEl.innerHTML = "";
          document.title = "Новость не найдена — ОБЗОР";
          return;
        }

        var title = textContent(match, "title");
        var category = textContent(match, "category");
        var date = textContent(match, "date");
        var image = textContent(match, "image");
        var bodyNode = match.getElementsByTagName("body")[0];
        var bodyHtml = bodyNode ? bodyNode.innerHTML.trim() : "";

        console.log("Title:", title, "Image:", image);

        titleEl.textContent = title;
        catEl.textContent = category;
        dateEl.textContent = date;
        dateEl.setAttribute("datetime", date);
        imgEl.src = image;
        imgEl.alt = title;
        bodyEl.innerHTML = bodyHtml;
        document.title = title + " — ОБЗОР";

        var list = document.createElement("ul");
        list.className = "news-aside-list";

        items.forEach(function (item) {
          if (item.getAttribute("id") === idParam) return;
          var t = textContent(item, "title");
          var itemId = item.getAttribute("id");
          var li = document.createElement("li");
          var a = document.createElement("a");
          a.className = "news-aside-link";
          a.href = "news.html?id=" + encodeURIComponent(itemId);
          a.textContent = t;
          li.appendChild(a);
          list.appendChild(li);
        });

        asideEl.innerHTML = "";
        asideEl.appendChild(list);
      })
      .catch(function (err) {
        console.error("Fetch/parse error:", err);
        articleEl.innerHTML = '<p class="news-error">Не удалось загрузить данные новости</p>';
        asideEl.innerHTML = "";
      });
  }
  

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    renderNewsFromXml();
  });
})();
