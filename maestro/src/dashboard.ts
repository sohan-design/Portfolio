/** Build Home dashboard markup for Figma node 169:510 */

function ticks(count: number, tallEvery = 5): string {
  return Array.from({ length: count }, (_, i) => {
    const tall = i % tallEvery === 0
    return `<span class="tick ${tall ? 'tick--tall' : ''}"></span>`
  }).join('')
}

function segs(filled: number, total: number): string {
  return Array.from({ length: total }, (_, i) => {
    const on = i < filled
    return `<span class="seg ${on ? 'seg--on' : ''}"></span>`
  }).join('')
}

function practiceCard(
  index: number,
  cropClass: string,
  blur: boolean,
): string {
  return `
  <article class="practice-card anim" style="--d:${0.28 + index * 0.06}s">
    <div
      class="practice-card__uv ${blur ? 'is-blurred' : ''}"
      data-shader-mount="practice-${index}"
    >
      <img class="uv-bitmap ${cropClass}" src="/assets/brand/uv-practice.png" alt="" />
      <canvas class="shader-canvas" data-shader-canvas aria-hidden="true"></canvas>
    </div>
    <div class="practice-card__wash" aria-hidden="true"></div>
    <div class="practice-card__body">
      <p class="eyebrow">beginner • lvl 3</p>
      <h3>Test CSS Flexbox Fundamentals</h3>
    </div>
    <button type="button" class="pill pill--white">
      2 mins
      <img src="/assets/icons/chevron.svg" width="5" height="7" alt="" />
    </button>
  </article>`
}

function achievement(
  title: string,
  tags: string[],
  crop: string,
): string {
  const tagHtml = tags
    .map((t) => `<span class="tag">${t}</span>`)
    .join('')
  return `
  <div class="achievement anim">
    <div class="achievement__icon">
      <img class="uv-bitmap ${crop}" src="/assets/brand/uv-practice.png" alt="" />
    </div>
    <div class="achievement__body">
      <p class="achievement__title">${title}</p>
      <div class="tags">${tagHtml}</div>
    </div>
  </div>`
}

function skill(name: string, level: string, filled: number): string {
  return `
  <div class="skill anim">
    <div class="skill__row">
      <span>${name}</span>
      <span>${level}</span>
    </div>
    <div class="seg-row">${segs(filled, 4)}</div>
  </div>`
}

export function renderDashboard(): string {
  return `
  <div class="home" data-node="169:510">
    <div class="shell">
      <main class="main">
        <header class="profile anim" style="--d:0.02s">
          <div class="profile__left">
            <div class="avatar">
              <img src="/assets/avatars/profile.png" alt="" />
            </div>
            <div>
              <p class="profile__name">Arnab Chaudhuri</p>
              <p class="profile__role">Aspiring Frontend Developer</p>
            </div>
          </div>
          <div class="lvl-badge">
            <div class="lvl-badge__ring">
              <img class="lvl-badge__e2" src="/assets/icons/ellipse2.svg" alt="" />
              <img class="lvl-badge__e3" src="/assets/icons/ellipse3.svg" alt="" />
              <div class="lvl-badge__hex">
                <img src="/assets/brand/lvl-hex.png" alt="" />
              </div>
            </div>
            <div class="lvl-badge__txt">
              <span>LVL</span>
              <strong>12</strong>
            </div>
          </div>
        </header>

        <nav class="tabs anim" style="--d:0.08s" aria-label="Primary">
          <a class="tab is-active" href="#">dashboard</a>
          <a class="tab" href="#">projects</a>
          <a class="tab" href="#">Practice</a>
          <a class="tab" href="#">Openings</a>
        </nav>

        <section class="level anim" style="--d:0.14s" aria-label="Level progress">
          <div class="level__track">
            <div class="level__fill"></div>
            <div class="level__ticks">
              <div class="tick-group">${ticks(30)}</div>
              <div class="tick-group">${ticks(25)}</div>
              <div class="tick-group">${ticks(25)}</div>
            </div>
            <div class="level__knob" aria-hidden="true">
              <img src="/assets/avatars/profile.png" alt="" />
            </div>
          </div>
          <div class="level__labels">
            <span>Beginner</span>
            <span>Expert</span>
          </div>
          <div class="callout callout--lvl anim" style="--d:0.22s">
            <img class="callout__tail" src="/assets/brand/tooltip-tail.png" alt="" />
            <div class="callout__pill">Lvl  12 of 32</div>
          </div>
        </section>

        <section class="up-next anim" style="--d:0.2s">
          <div class="up-next__media">
            <div class="up-next__uv" data-shader-mount="up-next">
              <img class="uv-bitmap uv-upnext" src="/assets/brand/uv-upnext.png" alt="" />
              <canvas class="shader-canvas" data-shader-canvas aria-hidden="true"></canvas>
            </div>
          </div>
          <div class="up-next__body">
            <div class="up-next__top">
              <div>
                <h2>Up Next</h2>
                <p class="up-next__title">Async Javascript Functions</p>
              </div>
              <button type="button" class="pill pill--ink">
                <img src="/assets/icons/play.svg" width="14" height="14" alt="" />
                Continue
              </button>
            </div>
            <div class="up-next__meta">
              <div class="up-next__meta-row">
                <span>Frontend Web Development</span>
                <strong>25%</strong>
              </div>
              <div class="seg-row">${segs(3, 12)}</div>
            </div>
          </div>
        </section>

        <section class="practice">
          <div class="practice__head anim" style="--d:0.26s">
            <h2>Start Practice</h2>
            <button type="button" class="linkish">View all</button>
          </div>
          <div class="practice__row">
            ${practiceCard(0, 'uv-p0', true)}
            ${practiceCard(1, 'uv-p1', false)}
            ${practiceCard(2, 'uv-p2', true)}
            ${practiceCard(3, 'uv-p3', true)}
          </div>
          <div class="practice__fade" aria-hidden="true"></div>
          <div class="callout callout--promise anim" style="--d:0.4s">
            <img class="callout__tail" src="/assets/brand/tooltip-tail.png" alt="" />
            <div class="callout__pill">We promise!</div>
          </div>
        </section>

        <div class="now-playing anim" style="--d:0.45s">
          <div class="now-playing__controls">
            <button type="button" class="icon-btn" aria-label="Previous">
              <img src="/assets/icons/previous.svg" width="14" height="14" alt="" />
            </button>
            <button type="button" class="icon-btn icon-btn--play" aria-label="Play">
              <img src="/assets/icons/play-circle.svg" width="34" height="34" alt="" />
            </button>
            <button type="button" class="icon-btn" aria-label="Next">
              <img src="/assets/icons/next.svg" width="14" height="14" alt="" />
            </button>
          </div>
          <div class="now-playing__meta">
            <div class="now-playing__titles">
              <span class="now-playing__label">Now Playing</span>
              <span class="now-playing__track">Async Javascript Functions</span>
            </div>
            <div class="now-playing__bar">
              <span class="now-playing__done"></span>
              <span class="now-playing__rest"></span>
            </div>
          </div>
        </div>
      </main>

      <aside class="rail">
        <section class="streak card anim" style="--d:0.12s">
          <div class="streak__copy">
            <h2>3 Day Streak!</h2>
            <p>Your are on the right track</p>
          </div>
          <div class="streak__week">
            <div class="day"><span>Mon</span><img src="/assets/icons/token-check.svg" width="20" height="20" alt="" /></div>
            <div class="day"><span>Tue</span><img src="/assets/icons/token-empty.svg" width="20" height="20" alt="" /></div>
            <div class="day"><span>Wed</span><img src="/assets/icons/token-empty.svg" width="20" height="20" alt="" /></div>
            <div class="day"><span>Thu</span><strong>6</strong></div>
            <div class="day"><span>Fri</span><strong>7</strong></div>
            <div class="day"><span>Sat</span><strong>8</strong></div>
            <div class="day"><span>Sun</span><strong>9</strong></div>
          </div>
          <img class="streak__badge" src="/assets/icons/pentagon.svg" width="51" height="51" alt="" />
          <div class="callout callout--streak anim" style="--d:0.3s">
            <img class="callout__tail" src="/assets/brand/tooltip-tail.png" alt="" />
            <div class="callout__pill">Well done!</div>
          </div>
        </section>

        <section class="achievements">
          <h2 class="anim" style="--d:0.18s">Achievements</h2>
          <div class="achievements__list">
            ${achievement('CSS Mastery Badge x 100', ['CSS', 'Animation Specialist', 'Figma'], 'uv-a0')}
            ${achievement('CSS Animator Title', ['CSS', 'Animation Specialist', 'Figma', 'UI/UX Innovator'], 'uv-a1')}
            ${achievement('Figma Expert', ['CSS', 'Animation Specialist', 'Figma'], 'uv-a2')}
          </div>
        </section>

        <hr class="rule" />

        <section class="skills">
          <h2 class="anim" style="--d:0.22s">Communication Skills</h2>
          <div class="skills__list">
            ${skill('Non-verbal', 'Intermediate', 1)}
            ${skill('Written', 'Expert', 2)}
            ${skill('Interpersonal', 'Proficient', 1)}
            ${skill('Presentation', 'Advanced', 1)}
          </div>
        </section>

        <hr class="rule" />

        <section class="trending anim" style="--d:0.34s">
          <h2>Trending Topics</h2>
          <article class="trending__item">
            <div class="trending__thumb">
              <img src="/assets/brand/uv-upnext.png" alt="" />
            </div>
            <div>
              <p class="trending__title">Color is finally OK</p>
              <p class="trending__blurb">A solo developer’s blog post replaced sixty years of color science. Most designers and developers missed it</p>
            </div>
          </article>
        </section>
      </aside>

      <button type="button" class="ask-ai anim" style="--d:0.5s" aria-label="Ask AI">
        <img src="/assets/icons/ask-ai.png" width="56" height="56" alt="" />
        <span>Ask AI</span>
      </button>
    </div>
  </div>`
}
