/** Single site footer. Edit this file to update every page. */
var FOOTER_HTML =
  '<canvas class="cta-dither" data-cta-wave aria-hidden="true"></canvas>' +
  '<div class="cta-inner">' +
    '<div class="cta-hero-copy">' +
      '<p class="cta-num">05</p>' +
      '<h2 class="cta-title">Contact me</h2>' +
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
        '<a class="btn-primary selection-control" href="/assets/Sohan-Bhute-Resume.pdf" download="Sohan-Bhute-Resume.pdf">' +
          '<span class="action-content">' +
            '<span class="action-label">Resume</span>' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 4v12M8 12l4 4 4-4M6 20h12" stroke-linecap="round" stroke-linejoin="round"></path></svg>' +
          '</span>' +
          '<span class="selection-handles" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
        '</a>' +
      '</div>' +
    '</div>' +
    '<p class="cta-colophon">© 2026 Sohan Bhute <span aria-hidden="true">·</span> Made with Cursor</p>' +
  '</div>';

export function mountSiteFooter() {
  document.querySelectorAll('[data-site-footer]').forEach(function (node) {
    node.remove();
  });

  // Full-bleed pages (e.g. infinite canvas) keep chrome out of the stage.
  if (document.body.classList.contains('tfh-page') || document.body.hasAttribute('data-no-site-footer')) {
    return;
  }

  var footer = document.createElement('section');
  footer.className = 'site-cta site-cta--pixel site-cta--dither';
  footer.setAttribute('data-site-footer', '');
  footer.innerHTML = FOOTER_HTML;

  // Body-level so the dither can hit every viewport edge.
  document.body.appendChild(footer);
}
