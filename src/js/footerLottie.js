import { DotLottie } from '@lottiefiles/dotlottie-web';

var players = [];

export function initFooterLotties() {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  Array.prototype.forEach.call(document.querySelectorAll('.footer-lottie'), function (canvas) {
    var player = new DotLottie({
      canvas: canvas,
      src: '/assets/common/cat-crying.lottie',
      autoplay: !reduce,
      loop: true,
    });
    players.push(player);
  });
}
