/** Single site footer. Edit this file to update every page. */
var FOOTER_HTML =
  '<div class="cta-inner">' +
    '<h2 class="cta-title">Let&rsquo;s build something people<br />actually want.</h2>' +
    '<p class="cta-sub">Whether you&rsquo;re starting from scratch or refining what exists, I&rsquo;m ready to help.</p>' +
    '<div class="cta-actions">' +
      '<a class="btn-primary selection-control" href="https://www.linkedin.com/in/sohan-bhute/" target="_blank" rel="noopener">' +
        '<span class="action-content">' +
          '<span class="action-label">LinkedIn</span>' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"></path></svg>' +
        '</span>' +
        '<span class="selection-handles" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
      '</a>' +
      '<button class="btn-primary selection-control" type="button" data-copy-email="sohan.work@proton.me">' +
        '<span class="action-content">' +
          '<span class="action-label">Email</span>' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="1.5"></rect><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4H5.5A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"></path></svg>' +
        '</span>' +
        '<span class="selection-handles" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
      '</button>' +
    '</div>' +
    '<p class="cta-colophon">© 2026 Sohan Bhute <span aria-hidden="true">·</span> Made with Cursor</p>' +
  '</div>' +
  '<canvas class="cta-pixel-wave" data-cta-wave aria-hidden="true"></canvas>';

export function mountSiteFooter() {
  document.querySelectorAll('.site-cta--pixel').forEach(function (node) {
    node.remove();
  });

  var host = document.querySelector('.cs-panel') || document.querySelector('.site') || document.querySelector('main');
  if (!host) return;

  var footer = document.createElement('section');
  footer.className = 'site-cta site-cta--pixel';
  footer.setAttribute('data-site-footer', '');
  footer.innerHTML = FOOTER_HTML;
  host.appendChild(footer);
}
