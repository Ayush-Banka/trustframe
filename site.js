/* TrustFrame site script: header, notes, copy buttons, contact form, Exhibit 1 demo, poll, hover definitions, Fig. 1. */
(function () {
  "use strict";

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Header ---------- */
  var header = document.querySelector("[data-header]");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 4); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var toggle = document.querySelector("[data-menu-toggle]");
  var menu = document.getElementById("nav-menu");
  function setMenu(open) {
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "Close" : "Menu";
  }
  toggle.addEventListener("click", function () {
    var open = toggle.getAttribute("aria-expanded") !== "true";
    setMenu(open);
    if (open) { var first = menu.querySelector("a"); if (first) first.focus(); }
  });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setMenu(false); toggle.focus(); }
  });
  document.addEventListener("click", function (e) {
    if (toggle.getAttribute("aria-expanded") === "true" && !header.contains(e.target)) setMenu(false);
  });
  var wide = window.matchMedia("(min-width: 880px)");
  var onWide = function (e) { if (e.matches) setMenu(false); };
  if (wide.addEventListener) wide.addEventListener("change", onWide); else if (wide.addListener) wide.addListener(onWide);

  /* ---------- Highlight and margin-note pairing ---------- */
  var groups = {};
  document.querySelectorAll("[data-note]").forEach(function (el) {
    var id = el.getAttribute("data-note");
    (groups[id] = groups[id] || []).push(el);
  });
  Object.keys(groups).forEach(function (id) {
    var els = groups[id];
    var note = document.getElementById(id);
    if (note && els.indexOf(note) === -1) els.push(note);
    function on() { els.forEach(function (el) { el.classList.add("is-linked"); }); }
    function off() { els.forEach(function (el) { el.classList.remove("is-linked"); }); }
    els.forEach(function (el) {
      el.addEventListener("mouseenter", on);
      el.addEventListener("mouseleave", off);
      el.addEventListener("focusin", on);
      el.addEventListener("focusout", off);
    });
  });

  /* ---------- Copy buttons (contact details) ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var label = btn.textContent;
    var aria = btn.getAttribute("aria-label") || label;
    var resetTimer = null;
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      function done(msg) {
        clearTimeout(resetTimer);
        btn.textContent = msg;
        btn.setAttribute("aria-label", msg);
        btn.classList.add("is-done");
        resetTimer = setTimeout(function () { btn.textContent = label; btn.setAttribute("aria-label", aria); btn.classList.remove("is-done"); }, 2000);
      }
      function selectInstead() {
        var value = btn.parentElement.querySelector(".contact-value");
        var range = document.createRange();
        range.selectNodeContents(value);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        done("Selected");
      }
      try {
        navigator.clipboard.writeText(text).then(function () { done("Copied"); }, selectInstead);
      } catch (e) {
        selectInstead();
      }
    });
  });
})();

/* Contact form: sends to Formspree. Each message is emailed to the Formspree account that owns the form. */
(function () {
  "use strict";
  var formUrl = function () { return atob("ZHllZW9sd3gvZi9vaS5lZXJwc21yb2YvLzpzcHR0aA==").split("").reverse().join(""); };
  var CONTACT_EMAIL = "iayushbanka@gmail.com";

  var form = document.querySelector("[data-contact-form]");
  if (!form) return;

  var status = form.querySelector("[data-form-status]");
  var submitButton = form.querySelector('button[type="submit"]');
  var submitLabel = submitButton.textContent;
  var fields = {
    name: form.querySelector("#f-name"),
    email: form.querySelector("#f-email"),
    message: form.querySelector("#f-message")
  };
  var requiredKeys = ["name", "email", "message"];
  var attempted = false;

  function setError(input, text) {
    var error = document.getElementById(input.id + "-error");
    if (text) {
      input.setAttribute("aria-invalid", "true");
      error.textContent = text;
      error.hidden = false;
    } else {
      input.removeAttribute("aria-invalid");
      error.textContent = "";
      error.hidden = true;
    }
  }

  function validateField(key) {
    var input = fields[key];
    var value = input.value.trim();
    var text = "";
    if (key === "name" && !value) text = "Enter your name.";
    if (key === "message" && !value) text = "Enter a message so we know how to help.";
    if (key === "email") {
      if (!value) text = "Enter your work email.";
      else if (input.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        text = "Enter an email address like name@company.com.";
      }
    }
    setError(input, text);
    return !text;
  }

  requiredKeys.forEach(function (key) {
    ["input", "blur"].forEach(function (type) {
      fields[key].addEventListener(type, function () { if (attempted) validateField(key); });
    });
  });

  function showStatus(kind, text) {
    status.classList.toggle("is-error", kind === "error");
    status.textContent = "";
    status.hidden = false;
    setTimeout(function () {
      status.textContent = text;
      if (kind === "error") {
        status.append(" You can also email us at ");
        var a = document.createElement("a");
        a.href = "mailto:" + CONTACT_EMAIL;
        a.textContent = CONTACT_EMAIL;
        status.append(a, ".");
      }
    }, 60);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    attempted = true;

    var firstInvalid = null;
    requiredKeys.forEach(function (key) {
      var ok = validateField(key);
      if (!ok && !firstInvalid) firstInvalid = key;
    });
    if (firstInvalid) {
      status.hidden = true;
      fields[firstInvalid].focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending…";
    status.hidden = true;

    fetch(formUrl(), {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    }).then(function (response) {
      if (response.ok) {
        form.reset();
        attempted = false;
        showStatus("ok", "Message sent. Thank you for getting in touch.");
        return;
      }
      return response.json().catch(function () { return {}; }).then(function (data) {
        var detail = "";
        if (data && Array.isArray(data.errors) && data.errors.length) {
          detail = " " + data.errors.map(function (e) { return e.message; }).join(" ");
        }
        showStatus("error", "Your message could not be sent." + detail + " Try again in a moment.");
      });
    }).catch(function () {
      showStatus("error", "Your message could not be sent. Check your internet connection and try again.");
    }).then(function () {
      submitButton.disabled = false;
      submitButton.textContent = submitLabel;
    });
  });
})();

/* Exhibit 1 demo (fictional data) and the home-page poll. */
(function () {
  "use strict";

  /* ---------- Exhibit 1: interactive concept demo ---------- */
  var demo = document.querySelector("[data-demo]");
  if (demo) {
    var BANK = "Example Bank Ltd.";
    var NAMES = { car: "Capital adequacy ratio", lcr: "Liquidity coverage ratio" };
    var TABLES = { car: "Section 4, table 4.2", lcr: "Section 4, table 4.5" };
    var DATA = {
      fy26: {
        label: "FY 2025-26", doc: "Annual disclosure FY 2025-26", published: "30 Jun 2026",
        car: { v: 16.4, unit: "%", page: 42 }, lcr: { v: 128, unit: "%", page: 44 },
        circ: { id: "EX/2026/07", title: "Capital buffer guidance", issued: "14 Feb 2026", effective: "1 Apr 2026", links: "Capital adequacy ratio (4.1)" }
      },
      fy25: {
        label: "FY 2024-25", doc: "Annual disclosure FY 2024-25", published: "28 Jun 2025",
        car: { v: 15.8, unit: "%", page: 39 }, lcr: { v: 121, unit: "%", page: 41 },
        circ: { id: "EX/2024/18", title: "Liquidity reporting update", issued: "9 Sep 2024", effective: "1 Jan 2025", links: "Liquidity coverage ratio (4.1)" }
      }
    };
    var PREV = { fy26: "fy25", fy25: null };
    var period = "fy26";
    var showChanges = true;
    var DEFAULT_NOTES = {};
    ["x1", "x2", "x3"].forEach(function (id) { DEFAULT_NOTES[id] = document.getElementById(id).innerHTML; });

    function fmt(d) { return d.v + d.unit; }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    function trail(letter, title, rows) {
      return '<span class="note-num">' + letter + '</span><strong>' + esc(title) + '</strong><ol class="trail">' +
        rows.map(function (r) { return '<li><span class="k">' + esc(r[0]) + '</span>' + esc(r[1]) + '</li>'; }).join("") +
        '</ol><p class="trail-foot">Fictional example.</p>';
    }
    var noteTimers = {};
    function setNote(id, html, quiet) {
      var note = document.getElementById(id);
      clearTimeout(noteTimers[id]);
      note.classList.add("is-swapping");
      noteTimers[id] = setTimeout(function () {
        noteTimers[id] = null;
        note.innerHTML = html;
        note.classList.remove("is-swapping");
        note.classList.toggle("is-open", html !== DEFAULT_NOTES[id]);
      }, 140);
      if (!quiet && window.matchMedia("(max-width: 1099px)").matches) {
        setTimeout(function () {
          var r = note.getBoundingClientRect();
          var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          if (r.top < 70 || r.bottom > window.innerHeight) note.scrollIntoView({ block: "nearest", behavior: calm ? "auto" : "smooth" });
        }, 200);
      }
    }
    function clearOpen(id) {
      demo.querySelectorAll('.fig[data-target="' + id + '"], [data-diff] button').forEach(function (b) {
        if (id === "x3" || b.getAttribute("data-target") === id) { b.classList.remove("is-open"); b.setAttribute("aria-expanded", "false"); }
      });
    }

    function openItem(item, btn) {
      var d = DATA[period];
      var target = btn.getAttribute("data-target");
      var already = btn.classList.contains("is-open");
      clearOpen(target);
      if (already) { setNote(target, DEFAULT_NOTES[target]); return; }
      btn.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      if (item === "circ") {
        setNote(target, trail("B", "Connections", [
          ["Circular", d.circ.id + ", " + d.circ.title],
          ["Issued by", "Example Regulator (fictional)"],
          ["Dates", "Issued " + d.circ.issued + ", effective " + d.circ.effective],
          ["Applies to", "Commercial banks, including " + BANK],
          ["Linked to", d.circ.links]
        ]));
      } else {
        setNote(target, trail("A", "Source trail", [
          ["Figure", NAMES[item] + ": " + fmt(d[item])],
          ["Found in", TABLES[item] + ", page " + d[item].page],
          ["Document", d.doc],
          ["Published", d.published],
          ["Bank", BANK]
        ]));
      }
    }

    function openDiff(item, btn) {
      var now = DATA[period], before = DATA[PREV[period]];
      var already = btn.classList.contains("is-open");
      clearOpen("x3");
      if (already) { setNote("x3", DEFAULT_NOTES.x3); return; }
      btn.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      var delta = Math.round((now[item].v - before[item].v) * 10) / 10;
      setNote("x3", trail("C", "Side by side", [
        ["Item", NAMES[item]],
        [before.label, fmt(before[item]) + " (page " + before[item].page + ")"],
        [now.label, fmt(now[item]) + " (page " + now[item].page + ")"],
        ["Change", (delta > 0 ? "Up " : "Down ") + Math.abs(delta) + (now[item].unit === "%" && item === "car" ? " points" : " points")]
      ]));
    }

    function render(pop) {
      var d = DATA[period], prev = PREV[period] ? DATA[PREV[period]] : null;
      demo.querySelectorAll(".seg-btn").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-period") === period)); });
      demo.querySelectorAll(".fig").forEach(function (b) {
        var item = b.getAttribute("data-item");
        b.textContent = item === "circ" ? "Circular " + d.circ.id : fmt(d[item]);
        b.setAttribute("aria-label", (item === "circ" ? "Circular " + d.circ.id : NAMES[item] + " " + fmt(d[item])) + ". Show where it came from");
        b.classList.remove("is-open");
        b.setAttribute("aria-expanded", "false");
        if (pop) { b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }
      });
      demo.querySelectorAll("[data-was]").forEach(function (s) {
        var item = s.getAttribute("data-was");
        if (showChanges && prev && prev[item].v !== d[item].v) {
          var delta = Math.round((d[item].v - prev[item].v) * 10) / 10;
          s.innerHTML = "was <s>" + fmt(prev[item]) + "</s> <b>" + (delta > 0 ? "+" : "") + delta + (item === "car" ? " pts" : " pts") + "</b>";
        } else {
          s.innerHTML = "";
        }
      });
      var list = demo.querySelector("[data-diff]");
      var summary = demo.querySelector("[data-diff-summary]");
      list.innerHTML = "";
      if (prev) {
        var changed = ["car", "lcr"].filter(function (k) { return prev[k].v !== d[k].v; });
        summary.textContent = (changed.length === 2 ? "two items were" : changed.length + " item was") + " updated";
        changed.forEach(function (k) {
          var li = document.createElement("li");
          var b = document.createElement("button");
          b.type = "button";
          b.setAttribute("aria-controls", "x3");
          b.setAttribute("aria-expanded", "false");
          b.innerHTML = "<span>" + esc(NAMES[k]) + "</span><span>" + esc(fmt(prev[k])) + " &rarr; <b>" + esc(fmt(d[k])) + "</b></span>";
          b.addEventListener("click", function () { openDiff(k, b); });
          li.appendChild(b);
          list.appendChild(li);
        });
      } else {
        summary.textContent = "there is no earlier period in this example to compare with";
      }
      ["x1", "x2", "x3"].forEach(function (id) {
        var n = document.getElementById(id);
        if (noteTimers[id] || n.innerHTML !== DEFAULT_NOTES[id]) setNote(id, DEFAULT_NOTES[id], true);
      });
    }

    demo.querySelectorAll(".seg-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        var next = b.getAttribute("data-period");
        if (next === period) return;
        period = next;
        render(true);
      });
    });
    demo.querySelector("[data-changes]").addEventListener("change", function (e) { showChanges = e.target.checked; render(false); });
    demo.querySelectorAll(".fig").forEach(function (b) {
      b.addEventListener("click", function () { openItem(b.getAttribute("data-item"), b); });
    });
    render(false);
  }

  /* ---------- Home-page poll ---------- */
  var poll = document.querySelector("[data-poll]");
  if (!poll) return;
  var pollUrl = function () { return atob("ZHllZW9sd3gvZi9vaS5lZXJwc21yb2YvLzpzcHR0aA==").split("").reverse().join(""); };
  var CONTACT_EMAIL = "iayushbanka@gmail.com";
  var steps = Array.prototype.slice.call(poll.querySelectorAll(".poll-q"));
  var stepLabel = poll.querySelector("[data-poll-step]");
  var bars = poll.querySelectorAll(".poll-bar i");
  var status = poll.querySelector("[data-poll-status]");
  var lastPointer = 0;

  function show(n, focus) {
    steps.forEach(function (s, i) { s.hidden = i !== n - 1; });
    stepLabel.textContent = "Question " + n + " of " + steps.length;
    bars.forEach(function (b, i) { b.classList.toggle("on", i < n); });
    if (focus) {
      var first = steps[n - 1].querySelector("input:checked") || steps[n - 1].querySelector("input");
      if (first) first.focus({ preventScroll: true });
    }
  }
  function answered(step) {
    return !!step.querySelector('.poll-opts input:checked');
  }
  function stepError(step, on) {
    var err = step.querySelector("[data-q-error]");
    var msg = err.getAttribute("data-msg") || err.textContent;
    err.setAttribute("data-msg", msg);
    if (!on) { err.hidden = true; return; }
    err.textContent = "";
    err.hidden = false;
    setTimeout(function () { err.textContent = msg; }, 60);
  }

  /* mirror checked state as a class, for browsers without :has() */
  var syncChecked = function () {
    poll.querySelectorAll(".opt, .chip-opt").forEach(function (l) {
      var input = l.querySelector("input");
      l.classList.toggle("is-checked", !!(input && input.checked));
    });
  };
  poll.addEventListener("change", syncChecked);

  steps.forEach(function (step, i) {
    var n = i + 1;
    step.querySelectorAll(".opt").forEach(function (o) {
      o.addEventListener("pointerdown", function () { lastPointer = Date.now(); });
    });
    step.addEventListener("change", function (e) {
      if (answered(step)) stepError(step, false);
      if (n < steps.length && e.target.type === "radio" && Date.now() - lastPointer < 1500) {
        setTimeout(function () { show(n + 1, true); }, 280);
      }
    });
    var next = step.querySelector("[data-next]");
    if (next) next.addEventListener("click", function () {
      if (!answered(step)) { stepError(step, true); return; }
      show(n + 1, true);
    });
    var back = step.querySelector("[data-back]");
    if (back) back.addEventListener("click", function () { show(n - 1, true); });
  });

  poll.addEventListener("submit", function (event) {
    event.preventDefault();
    var last = steps[steps.length - 1];
    if (!answered(last)) { stepError(last, true); return; }
    var data = new FormData();
    var get = function (name) { var el = poll.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ""; };
    var sources = Array.prototype.map.call(poll.querySelectorAll('input[name="sources"]:checked'), function (el) { return el.value; });
    data.append("_subject", "TrustFrame poll response");
    data.append("_gotcha", poll.querySelector('input[name="_gotcha"]').value);
    data.append("form", "Home page poll");
    data.append("What do you check first", get("check_first"));
    data.append("How long a review takes", get("review_time"));
    data.append("Where they look", sources.join("; "));
    data.append("Works at", get("role") || "Not given");

    var submit = poll.querySelector('button[type="submit"]');
    var label = submit.textContent;
    submit.disabled = true;
    submit.textContent = "Sending…";
    status.hidden = true;

    fetch(pollUrl(), { method: "POST", body: data, headers: { Accept: "application/json" } })
      .then(function (response) {
        if (response.ok) {
          steps.forEach(function (s) { s.hidden = true; });
          poll.querySelector("[data-poll-top]").hidden = true;
          var done = poll.querySelector("[data-poll-done]");
          done.hidden = false;
          done.focus({ preventScroll: true });
          return;
        }
        return response.json().catch(function () { return {}; }).then(function (d) {
          var detail = d && Array.isArray(d.errors) && d.errors.length ? " " + d.errors.map(function (e) { return e.message; }).join(" ") : "";
          fail("Your answers could not be sent." + detail + " Try again in a moment.");
        });
      })
      .catch(function () { fail("Your answers could not be sent. Check your internet connection and try again."); })
      .then(function () { submit.disabled = false; submit.textContent = label; });

    function fail(text) {
      status.textContent = "";
      status.hidden = false;
      setTimeout(function () {
        status.textContent = text + " You can also email us at ";
        var a = document.createElement("a");
        a.href = "mailto:" + CONTACT_EMAIL;
        a.textContent = CONTACT_EMAIL;
        status.append(a, ".");
      }, 60);
    }
  });
})();

/* Hover definitions and Fig. 1 (scattered sources to one record). */
(function () {
  "use strict";

  /* ---------- Hover definitions ---------- */
  var DEFS = {"banking-partner":["Banking partner","A bank that provides accounts, payments, cards or lending that a fintech offers to its own customers. It is often called a sponsor bank. The fintech builds the product on top of the bank's licence and systems."],"car":["Capital adequacy ratio","A bank's capital compared with its risk-weighted assets. A higher ratio means a bigger cushion to absorb losses."],"disclosure":["Disclosure","Information a bank publishes about its finances, risks and governance, often because regulators require it."],"due-diligence":["Due diligence","The checks a company carries out on a partner before and during a working relationship."],"gnpa":["Gross NPA ratio","Non-performing assets are loans that have stopped earning, usually because the borrower has not paid for 90 days or more. The gross NPA ratio is those loans as a share of all loans. A lower ratio means fewer problem loans."],"knowledge-graph":["Knowledge graph","A way of storing information as connected records, such as a bank linked to its regulator, its disclosures and the circulars that apply to it, so relationships can be followed directly."],"lcr":["Liquidity coverage ratio","The high-quality liquid assets a bank holds compared with the cash it could need in a 30-day stress period. Above 100% means it holds enough."],"pillar-3":["Pillar 3 disclosures","Reports banks publish under the international Basel framework, setting out their capital, risk exposures and how they manage risk. They are one of the public sources TrustFrame is designed to read."],"circular":["Regulatory circular","An official notice from a regulator that sets or changes rules for the institutions it supervises."],"reporting-period":["Reporting period","The span of time a disclosure covers, such as a financial year. Comparing the same figure across periods shows what changed."],"rwa":["Risk-weighted assets","A bank's assets adjusted for risk, so riskier loans count for more. Capital ratios are measured against this figure."],"source-trail":["Source trail","TrustFrame's term for the record of where a figure came from: the document, section, page and date. Every figure in the concept previews on this site has one."]};
  var terms = Array.prototype.slice.call(document.querySelectorAll(".term[data-term]"));
  if (terms.length) {
    var tip = document.createElement("div");
    tip.className = "term-tip";
    tip.id = "term-tip";
    tip.setAttribute("role", "tooltip");
    tip.hidden = true;
    document.body.appendChild(tip);
    var current = null;
    var shownAt = 0;
    var lastPointer = "mouse";

    var place = function (el) {
      var r = el.getBoundingClientRect();
      var tw = tip.offsetWidth;
      var th = tip.offsetHeight;
      var vw = document.documentElement.clientWidth;
      var left = Math.min(Math.max(16, r.left + r.width / 2 - tw / 2), vw - tw - 16);
      var side = r.top - th - 12 > 72 ? "top" : "bottom";
      var top = side === "top" ? r.top - th - 10 : r.bottom + 10;
      tip.style.left = left + window.scrollX + "px";
      tip.style.top = top + window.scrollY + "px";
      tip.setAttribute("data-side", side);
      tip.style.setProperty("--ax", Math.min(Math.max(12, r.left + r.width / 2 - left - 5), tw - 22) + "px");
    };
    var show = function (el) {
      var d = DEFS[el.getAttribute("data-term")];
      if (!d) return;
      if (current && current !== el) current.removeAttribute("aria-describedby");
      current = el;
      shownAt = Date.now();
      tip.innerHTML = "<b></b><span></span><span class=\"tip-hint\"></span>";
      tip.children[0].textContent = d[0];
      tip.children[1].textContent = d[1];
      tip.children[2].textContent = el.tagName === "A" ? (lastPointer === "touch" ? "Tap again for the glossary" : "Click for the glossary") : "";
      tip.hidden = false;
      el.setAttribute("aria-describedby", "term-tip");
      place(el);
      requestAnimationFrame(function () { tip.classList.add("is-on"); });
    };
    var hide = function () {
      if (!current) return;
      current.removeAttribute("aria-describedby");
      current = null;
      tip.classList.remove("is-on");
      tip.hidden = true;
    };
    terms.forEach(function (el) {
      if (el.tagName !== "A") el.setAttribute("tabindex", "0");
      el.addEventListener("pointerdown", function (e) { lastPointer = e.pointerType || "mouse"; });
      el.addEventListener("mouseenter", function () { if (lastPointer !== "touch") show(el); });
      el.addEventListener("mouseleave", hide);
      el.addEventListener("focus", function () { show(el); });
      el.addEventListener("blur", hide);
      el.addEventListener("click", function (e) {
        if (el.tagName === "A") {
          /* first tap on a touch screen shows the meaning; the next tap follows the link */
          if (lastPointer === "touch" && !(current === el && Date.now() - shownAt > 300)) { e.preventDefault(); show(el); }
          return;
        }
        if (current === el && Date.now() - shownAt > 400) hide();
        else show(el);
      });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); });
    document.addEventListener("pointerdown", function (e) { if (current && !e.target.closest(".term")) hide(); });
    window.addEventListener("scroll", function () { if (current) place(current); }, { passive: true });
    var lastW = window.innerWidth;
    window.addEventListener("resize", function () { if (window.innerWidth !== lastW) { lastW = window.innerWidth; hide(); } });
  }

  /* ---------- Fig. 1: scattered sources come together as you scroll ---------- */
  var fig = document.querySelector("[data-assemble]");
  if (fig) {
    var stage = fig.querySelector(".asm-stage");
    var record = fig.querySelector(".asm-record");
    var recHead = fig.querySelector(".asm-rec-head");
    var cards = Array.prototype.slice.call(fig.querySelectorAll(".asm-card"));
    var START = [[0.03, 18, -5], [0.51, 8, 4], [0.07, 196, 3], [0.49, 214, -4]];
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    var ticking = false;
    var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
    var band = function (t, a, b) { return clamp((t - a) / (b - a)); };
    var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

    var draw = function () {
      ticking = false;
      var W = stage.clientWidth;
      var vh = window.innerHeight;
      var r = stage.getBoundingClientRect();
      var p = reduce.matches ? 1 : clamp((vh * 0.92 - r.top) / (vh * 0.6));
      var cw = Math.max(140, W * 0.44);
      var ch = 92;
      var rowW = W - 40;
      var rowH = 54;
      var top0 = 10 + recHead.offsetHeight + 8;
      cards.forEach(function (c, i) {
        var t = ease(band(p, i * 0.07, 0.72 + i * 0.07));
        var s = START[i];
        var x = s[0] * W + (20 - s[0] * W) * t;
        var y = s[1] + (top0 + i * 62 - s[1]) * t;
        c.style.width = cw + (rowW - cw) * t + "px";
        c.style.height = ch + (rowH - ch) * t + "px";
        c.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + (s[2] * (1 - t)).toFixed(2) + "deg)";
        c.style.boxShadow = t > 0.98 ? "none" : "";
        c.querySelector(".asm-src").style.opacity = String(1 - band(t, 0.35, 0.7));
        c.querySelector(".asm-row").style.opacity = String(band(t, 0.55, 0.95));
      });
      record.style.opacity = String(band(p, 0.45, 0.9));
    };
    var request = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(draw); }
    };
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    if (reduce.addEventListener) reduce.addEventListener("change", request);
    draw();
  }
})();

/* Try it page: Ask TrustFrame, bank comparison, regulatory updates. Review-time calculator. All demo data is fictional. */
(function () {
  "use strict";

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function trailRows(rows) {
    return '<ol class="trail">' + rows.map(function (r) { return '<li><span class="k">' + esc(r[0]) + "</span>" + esc(r[1]) + "</li>"; }).join("") + "</ol>";
  }
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Review-time calculator (Use cases) ---------- */
  var calc = document.querySelector("[data-calc]");
  if (calc) {
    var hoursOut = document.querySelector("[data-calc-hours]");
    var daysOut = document.querySelector("[data-calc-days]");
    var update = function () {
      var n = {};
      ["banks", "hours", "times"].forEach(function (k) {
        var input = calc.elements[k];
        var v = Math.max(Number(input.min), Math.min(Number(input.max), Math.round(Number(input.value) || 0)));
        n[k] = v;
        calc.querySelector('[data-out="' + k + '"]').textContent = String(v);
      });
      var total = n.banks * n.hours * n.times;
      hoursOut.textContent = total.toLocaleString("en-IN");
      var days = Math.round((total / 8) * 10) / 10;
      daysOut.textContent = days.toLocaleString("en-IN");
    };
    calc.addEventListener("input", update);
    calc.addEventListener("submit", function (e) { e.preventDefault(); });
    update();
  }

  var dataEl = document.getElementById("demo-data");
  if (!dataEl) return;
  var D = JSON.parse(dataEl.textContent);
  function fmt(v, unit) { return String(v) + unit; }
  function narrow() { return window.matchMedia("(max-width: 1099px)").matches; }
  function bringIntoView(el) {
    var r = el.getBoundingClientRect();
    if (r.top < 80 || r.bottom > window.innerHeight) el.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }

  /* ---------- Compare three banks ---------- */
  var cmp = document.querySelector("[data-compare]");
  var note = document.getElementById("cmp-note");
  var noteDefault = note ? note.innerHTML : "";
  function cmpTrail(bank, m) {
    var b = D.banks[bank];
    var title, rows;
    if (D.measures[m]) {
      var v = D.values[bank][m];
      title = b.name + ": " + D.measures[m].name;
      rows = [["Figure", fmt(v[0], D.measures[m].unit)], ["Found in", "Section " + v[2] + ", table " + v[3] + ", page " + v[4]], ["Document", "Annual disclosure FY 2025-26"], ["Published", b.pub26]];
    } else if (m === "circ") {
      title = b.name + ": linked circulars";
      rows = D.links[bank].map(function (id) {
        var c = D.circulars.filter(function (x) { return x.id === id; })[0];
        return [id, c.title + ", issued " + c.date];
      });
    } else if (m === "chg") {
      title = b.name + ": changed since FY 2024-25";
      rows = D.changes[bank].map(function (k) {
        var v = D.values[bank][k];
        return [D.measures[k].name, fmt(v[1], D.measures[k].unit) + " to " + fmt(v[0], D.measures[k].unit) + " (pages " + v[5] + " and " + v[4] + ")"];
      });
    } else {
      title = b.name + ": latest annual disclosure";
      rows = [["Document", "Annual disclosure FY 2025-26"], ["Published", b.pub26], ["Found on", "Bank website, investor relations page"]];
    }
    return '<span class="note-num">*</span><strong>' + esc(title) + "</strong>" + trailRows(rows) + '<p class="trail-foot">Fictional example.</p>';
  }
  function openCell(btn, forceOpen) {
    var already = btn.classList.contains("is-open");
    cmp.querySelectorAll(".fig.is-open").forEach(function (b) { b.classList.remove("is-open"); b.setAttribute("aria-expanded", "false"); });
    note.classList.add("is-swapping");
    setTimeout(function () {
      if (already && !forceOpen) {
        note.innerHTML = noteDefault;
        note.classList.remove("is-open");
      } else {
        note.innerHTML = cmpTrail(btn.getAttribute("data-bank"), btn.getAttribute("data-m"));
        note.classList.add("is-open");
      }
      note.classList.remove("is-swapping");
      if (narrow()) bringIntoView(note);
    }, 140);
    if (!already || forceOpen) { btn.classList.add("is-open"); btn.setAttribute("aria-expanded", "true"); }
  }
  if (cmp) {
    cmp.querySelectorAll(".fig").forEach(function (b) {
      b.setAttribute("aria-expanded", "false");
      b.addEventListener("click", function () { openCell(b, false); });
    });
  }

  /* ---------- Regulatory updates ---------- */
  var feed = document.querySelector("[data-feed]");
  if (feed) {
    var items = Array.prototype.slice.call(feed.querySelectorAll(".feed-item"));
    var empty = feed.querySelector(".feed-empty");
    feed.querySelectorAll(".feed-filters .seg-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var topic = btn.getAttribute("data-topic");
        feed.querySelectorAll(".feed-filters .seg-btn").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        var shown = 0;
        items.forEach(function (it) {
          var on = topic === "all" || it.getAttribute("data-topic") === topic;
          it.hidden = !on;
          if (on) shown++;
        });
        empty.hidden = shown > 0;
      });
    });
    feed.querySelectorAll("button.aff").forEach(function (a) {
      a.addEventListener("click", function () {
        var cellBtn = cmp && cmp.querySelector('.fig[data-bank="' + a.getAttribute("data-bank") + '"][data-m="' + a.getAttribute("data-m") + '"]');
        if (!cellBtn) return;
        cellBtn.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
        openCell(cellBtn, true);
        cellBtn.classList.remove("pop"); void cellBtn.offsetWidth; cellBtn.classList.add("pop");
        setTimeout(function () { cellBtn.focus({ preventScroll: true }); }, reduce ? 0 : 450);
      });
    });
  }

  /* ---------- Ask TrustFrame ---------- */
  var ask = document.querySelector("[data-ask]");
  if (ask) {
    var qOut = ask.querySelector("[data-ask-question]");
    var qBox = ask.querySelector(".ask-q");
    var aOut = ask.querySelector("[data-ask-answer]");
    var sOut = ask.querySelector("[data-ask-sources]");
    var timer = null;
    var link = function (n, on) {
      ask.querySelectorAll('[data-src="' + n + '"]').forEach(function (el) { el.classList.toggle("is-linked", on); });
    };
    var render = function (a) {
      aOut.innerHTML = a.parts.map(function (p) {
        return typeof p === "number"
          ? '<button type="button" class="cite" data-src="' + p + '" aria-label="Source ' + p + '">' + p + "</button>"
          : esc(p);
      }).join("");
      sOut.innerHTML = a.sources.map(function (s, i) {
        var n = i + 1;
        return '<li class="ask-src" id="ask-src-' + n + '" data-src="' + n + '"><span class="ask-src-n">' + n + "</span><strong>" + esc(s.title) + "</strong>" + trailRows(s.rows) + "</li>";
      }).join("");
      aOut.classList.remove("is-thinking");
      aOut.classList.add("is-in");
      aOut.querySelectorAll(".cite").forEach(function (c) {
        var n = c.getAttribute("data-src");
        c.addEventListener("mouseenter", function () { link(n, true); });
        c.addEventListener("mouseleave", function () { link(n, false); });
        c.addEventListener("focus", function () { link(n, true); });
        c.addEventListener("blur", function () { link(n, false); });
        c.addEventListener("click", function () {
          ask.querySelectorAll(".is-linked").forEach(function (el) { el.classList.remove("is-linked"); });
          link(n, true);
          bringIntoView(sOut.querySelector('[data-src="' + n + '"]'));
        });
      });
    };
    ask.querySelectorAll(".ask-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        var a = D.ask.filter(function (x) { return x.id === chip.getAttribute("data-q"); })[0];
        ask.querySelectorAll(".ask-chip").forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
        qOut.textContent = a.q;
        qBox.classList.remove("is-empty");
        clearTimeout(timer);
        sOut.innerHTML = "";
        aOut.classList.remove("is-in");
        if (reduce) { render(a); return; }
        aOut.innerHTML = '<span class="ask-thinking">Finding sources<i></i><i></i><i></i></span>';
        aOut.classList.add("is-thinking");
        timer = setTimeout(function () { render(a); }, 650);
      });
    });
  }
})();

/* Arriving from a link like glossary/#g-car: make sure the section is in view once fonts have loaded. */
(function () {
  "use strict";
  var moved = false;
  ["wheel", "touchstart", "keydown", "pointerdown"].forEach(function (ev) {
    window.addEventListener(ev, function () { moved = true; }, { once: true, passive: true });
  });
  window.addEventListener("load", function () {
    if (moved || !location.hash || location.hash.length < 2) return;
    var id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (e) { return; }
    var target = document.getElementById(id);
    if (!target) return;
    var top = target.getBoundingClientRect().top;
    if (top > 40 && top < 160) return;
    var root = document.documentElement;
    var prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    target.scrollIntoView({ block: "start" });
    root.style.scrollBehavior = prev;
  });
})();

/* WhatsApp button: show the "Chat on WhatsApp" bubble once per visit, then tuck it away. */
(function () {
  "use strict";
  var wa = document.querySelector("[data-wa]");
  if (!wa || window.matchMedia("(max-width: 719px)").matches) return;
  var seen = false;
  try { seen = sessionStorage.getItem("tf-wa-peek") === "1"; } catch (e) { seen = false; }
  if (seen) return;
  setTimeout(function () {
    wa.classList.add("is-peek");
    try { sessionStorage.setItem("tf-wa-peek", "1"); } catch (e) { /* ignore */ }
    setTimeout(function () { wa.classList.remove("is-peek"); }, 4500);
  }, 2500);
})();

/* 404: show the address that was asked for, and suggest the closest real page. */
(function () {
  "use strict";
  var nf = document.querySelector("[data-nf]");
  if (!nf) return;
  var root = "/trustframe/";
  var path = location.pathname;
  var out = nf.querySelector("[data-nf-path]");
  if (out) out.textContent = decodeURIComponent(path) + location.search;
  var slug = path.indexOf(root) === 0 ? path.slice(root.length) : path.replace(/^\//, "");
  slug = slug.toLowerCase().replace(/\.html?$/, "").replace(/\/+$/, "").split("/")[0];
  if (!slug) return;
  var pages = [
    ["how-it-works", "How it works", "how-it-works/"], ["use-cases", "Use cases", "use-cases/"], ["try", "Try the concept", "try/"],
    ["about", "About", "about/"], ["contact", "Contact", "contact/"], ["glossary", "Glossary", "glossary/"],
    ["faq", "the FAQ", "about/#faq"], ["team", "About", "about/"], ["founders", "About", "about/"], ["demo", "Try the concept", "try/"],
    ["poll", "the three quick questions", "#poll"], ["calculator", "the review-time calculator", "use-cases/#calculator"],
    ["pdf", "the one-pager", "trustframe-one-pager.pdf"], ["one-pager", "the one-pager", "trustframe-one-pager.pdf"], ["home", "the home page", ""], ["index", "the home page", ""]
  ];
  var dist = function (a, b) {
    var m = [], i, j;
    for (i = 0; i <= a.length; i++) { m[i] = [i]; }
    for (j = 0; j <= b.length; j++) { m[0][j] = j; }
    for (i = 1; i <= a.length; i++) {
      for (j = 1; j <= b.length; j++) {
        m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
    }
    return m[a.length][b.length];
  };
  var best = null, bestScore = Infinity;
  pages.forEach(function (p) {
    var key = p[0];
    var score = (slug.indexOf(key) !== -1 || key.indexOf(slug) !== -1) && slug.length >= 3 ? 0 : dist(slug, key);
    if (score < bestScore) { bestScore = score; best = p; }
  });
  if (!best || bestScore > Math.max(2, Math.floor(best[0].length / 3))) return;
  var guess = nf.querySelector("[data-nf-guess]");
  guess.textContent = "Did you mean ";
  var a = document.createElement("a");
  a.href = root + best[2];
  a.textContent = best[1];
  guess.append(a, "?");
  guess.hidden = false;
})();
