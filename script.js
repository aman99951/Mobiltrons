// Hamburger toggle with proper ARIA
    (function () {
      var btn = document.getElementById('hamburger');
      var nav = document.getElementById('mobileNav');
      var topbar = document.querySelector('.sticky-topbar');
      if (!btn || !nav) return;

      btn.addEventListener('click', function () {
        var isOpen = btn.classList.toggle('open');
        nav.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen);
        nav.setAttribute('aria-hidden', !isOpen);
        if (isOpen && topbar) topbar.classList.remove('topbar-hidden');
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      nav.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          btn.classList.remove('open');
          nav.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
          nav.setAttribute('aria-hidden', 'true');
          if (topbar) topbar.classList.remove('topbar-hidden');
          document.body.style.overflow = '';
        });
      });
    })();

    // Hide topbar on scroll down, show on scroll up
    (function () {
      var topbar = document.querySelector('.sticky-topbar');
      var mobileNav = document.getElementById('mobileNav');
      if (!topbar) return;

      var lastY = window.scrollY || 0;
      var ticking = false;
      var threshold = 8;
      var revealAt = 16;

      function update() {
        var currentY = window.scrollY || 0;
        var delta = currentY - lastY;
        var isMobileNavOpen = mobileNav && mobileNav.classList.contains('open');

        if (currentY <= revealAt || isMobileNavOpen) {
          topbar.classList.remove('topbar-hidden');
        } else if (Math.abs(delta) > threshold) {
          if (delta > 0) {
            topbar.classList.add('topbar-hidden');
          } else {
            topbar.classList.remove('topbar-hidden');
          }
          lastY = currentY;
        }

        if (currentY < revealAt) lastY = currentY;
        ticking = false;
      }

      window.addEventListener('scroll', function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      }, { passive: true });
    })();

    // 3D card tilt interaction (desktop only)
    (function () {
      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var noFinePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;
      if (reduceMotion || noFinePointer) return;

      var items = document.querySelectorAll('.why-card, .about-card, .about-reason-card, .cat-card, .insight-card, .stat-box, .testimonial-media, .testimonial-quote, .reviews-comment-card');
      if (!items.length) return;

      items.forEach(function (item) {
        function tilt(e) {
          var rect = item.getBoundingClientRect();
          var px = (e.clientX - rect.left) / rect.width;
          var py = (e.clientY - rect.top) / rect.height;
          var isReviewCard = item.classList.contains('testimonial-media') || item.classList.contains('testimonial-quote') || item.classList.contains('reviews-comment-card');
          var ry = (px - 0.5) * (isReviewCard ? 14 : 10);
          var rx = (0.5 - py) * (isReviewCard ? 11 : 8);
          var lift = isReviewCard ? -8 : -4;
          item.style.transform = 'perspective(1100px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(' + lift + 'px) translateZ(0)';
        }

        function reset() {
          item.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0) translateZ(0)';
        }

        item.addEventListener('mousemove', tilt);
        item.addEventListener('mouseleave', reset);
      });
    })();
    // Testimonial carousel with left video + right comment (infinite loop)
    (function () {
      var carousel = document.querySelector('.reviews-v2-carousel');
      var track = carousel ? carousel.querySelector('.reviews-v2-track') : null;
      if (!carousel || !track) return;

      var testimonials = [
        {
          person: 'Murugan | Seller',
          title: 'Every sale counts for my small business.',
          body: "Mobitrons' zero-commission model is fantastic. It's a simple, effective way to reach new customers without giving up a percentage of my earnings.",
          video: './assets/Oil_maker_Landscape(1).mp4'
        },
        {
          person: 'Lakshmi | Customer',
          title: 'Secure and trustworthy experience.',
          body: 'I was skeptical at first, but the verification process and secure connection gave me confidence. I found a great local seller for my product needs, and the whole process was seamless.',
          video: './assets/Soap_Customer(Lakshmi) 1.mp4'
        },
        {
          person: 'Local Customer',
          title: 'Fresh homemade products nearby.',
          body: "I was looking for fresh, homemade dosa dough. I found a lady selling it just a few streets away on Mobitrons. I was able to call her through the app to confirm, and the flour was so fresh. It's great to support local people.",
          video: './assets/Food_Customer_2 1.mp4'
        }
      ];

      function slideHtml(item) {
        return '<div class="review-slide">'
          + '<article class="testimonial-media lp-story-card" aria-label="Video testimonial">'
          + '<video class="testimonial-video" width="480" height="260" controls preload="metadata" playsinline>'
          + '<source src="' + item.video + '" type="video/mp4" />'
          + '</video>'
          + '<div class="testimonial-tag">' + item.person + '</div>'
          + '</article>'
          + '<article class="testimonial-quote lp-story-card" aria-label="Written testimonial">'
          + '<div class="testimonial-mark" aria-hidden="true">"</div>'
          + '<blockquote><p class="testimonial-text"><strong>' + item.title + '</strong><br>' + item.body + '</p></blockquote>'
          + '<div class="testimonial-footer"><span class="testimonial-stars" aria-label="5 out of 5 stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span><span class="testimonial-sep" aria-hidden="true">|</span><cite>' + item.person + '</cite></div>'
          + '</article>'
          + '</div>';
      }

      var slides = [testimonials[testimonials.length - 1]].concat(testimonials, [testimonials[0]]);
      track.innerHTML = slides.map(slideHtml).join('');

      var index = 1;
      var locked = false;
      var autoTimer = null;
      var dragStartX = 0;
      var dragging = false;

      function setPos(animate) {
        track.style.transition = animate ? 'transform 1400ms cubic-bezier(.22,1,.36,1)' : 'none';
        track.style.transform = 'translateX(' + (-index * 100) + '%)';
      }

      function pauseWhenPlaying() {
        var activeVideo = track.children[index] ? track.children[index].querySelector('video') : null;
        return !!(activeVideo && !activeVideo.paused && !activeVideo.ended);
      }

      function move(dir) {
        if (locked) return;
        locked = true;
        index += dir;
        setPos(true);
      }

      function next() { move(1); }
      function prev() { move(-1); }

      track.addEventListener('transitionend', function () {
        if (index === slides.length - 1) {
          index = 1;
          setPos(false);
        } else if (index === 0) {
          index = testimonials.length;
          setPos(false);
        }
        locked = false;
      });

      function startAuto() {
        stopAuto();
        autoTimer = setInterval(function () {
          if (!pauseWhenPlaying()) next();
        }, 4200);
      }

      function stopAuto() {
        if (autoTimer) clearInterval(autoTimer);
        autoTimer = null;
      }

      carousel.addEventListener('mouseenter', stopAuto);
      carousel.addEventListener('mouseleave', startAuto);
      carousel.addEventListener('wheel', function (e) {
        e.preventDefault();
        stopAuto();
        if (e.deltaY > 0 || e.deltaX > 0) next();
        else prev();
        startAuto();
      }, { passive: false });

      carousel.addEventListener('mousedown', function (e) {
        dragging = true;
        dragStartX = e.clientX;
        carousel.classList.add('dragging');
        stopAuto();
      });

      window.addEventListener('mouseup', function (e) {
        if (!dragging) return;
        dragging = false;
        carousel.classList.remove('dragging');
        var dx = e.clientX - dragStartX;
        if (Math.abs(dx) > 30) {
          if (dx < 0) next();
          else prev();
        }
        startAuto();
      });

      setPos(false);
      track.querySelectorAll('video').forEach(function (v) { v.preload = 'auto'; });
      startAuto();
    })();

    // Synchronized marquee loops with hover control + pause while video plays
    (function () {
      var videoTrack = document.querySelector('.reviews-video-grid');
      var commentTrack = document.querySelector('.reviews-comments-grid');
      var wrappers = Array.prototype.slice.call(document.querySelectorAll('.reviews-marquee-wrap'));
      if (!videoTrack || !commentTrack || wrappers.length < 2) return;

      if (videoTrack.children.length < 2 || commentTrack.children.length < 2) return;

      var offset = 0;
      var stepVideo = 0;
      var stepComment = 0;
      var speed = 38; // px/sec shared speed for both tracks
      var pausedByHover = false;
      var pausedByVideo = false;
      var pausedByVisibility = false;
      var dragging = false;
      var lastX = 0;
      var lastTime = performance.now();

      function gapOf(el) {
        var g = parseFloat(window.getComputedStyle(el).columnGap || window.getComputedStyle(el).gap || '0');
        return Number.isFinite(g) ? g : 0;
      }

      function measure() {
        var firstVideo = videoTrack.children[0];
        var firstComment = commentTrack.children[0];
        if (!firstVideo || !firstComment) return;
        stepVideo = firstVideo.getBoundingClientRect().width + gapOf(videoTrack);
        stepComment = firstComment.getBoundingClientRect().width + gapOf(commentTrack);
      }

      function render() {
        videoTrack.style.transform = 'translateX(' + (-offset).toFixed(2) + 'px)';
        commentTrack.style.transform = 'translateX(' + (-(offset / stepVideo) * stepComment).toFixed(2) + 'px)';
      }

      function shiftOnce() {
        var firstVideo = videoTrack.firstElementChild;
        var firstComment = commentTrack.firstElementChild;
        if (!firstVideo || !firstComment) return;
        videoTrack.appendChild(firstVideo);
        commentTrack.appendChild(firstComment);
        offset -= stepVideo;
        render();
      }

      function anyMainVideoPlaying() {
        var vids = document.querySelectorAll('.reviews-video-grid .testimonial-media video');
        return Array.prototype.some.call(vids, function (v) { return !v.paused && !v.ended; });
      }

      function applyDelta(delta) {
        offset += delta;
        if (offset < 0) offset = 0;
        while (offset >= stepVideo) shiftOnce();
        render();
      }

      function tick(now) {
        var dt = (now - lastTime) / 1000;
        lastTime = now;
        if (!pausedByHover && !pausedByVideo && !pausedByVisibility && !dragging) applyDelta(speed * dt);
        requestAnimationFrame(tick);
      }

      wrappers.forEach(function (wrap) {
        wrap.addEventListener('mouseenter', function () { pausedByHover = true; });
        wrap.addEventListener('mouseleave', function () { pausedByHover = false; wrap.classList.remove('dragging'); dragging = false; });
        wrap.addEventListener('wheel', function (e) {
          e.preventDefault();
          pausedByHover = true;
          applyDelta(e.deltaY > 0 ? 120 : -120);
        }, { passive: false });
        wrap.addEventListener('mousedown', function (e) {
          dragging = true;
          lastX = e.clientX;
          pausedByHover = true;
          wrap.classList.add('dragging');
        });
      });

      window.addEventListener('mousemove', function (e) {
        if (!dragging) return;
        var dx = e.clientX - lastX;
        lastX = e.clientX;
        applyDelta(-dx);
      });

      window.addEventListener('mouseup', function () {
        dragging = false;
        wrappers.forEach(function (w) { w.classList.remove('dragging'); });
      });

      document.addEventListener('visibilitychange', function () {
        pausedByVisibility = document.visibilityState !== 'visible';
      });

      var mainVideos = document.querySelectorAll('.reviews-video-grid .testimonial-media video');
      mainVideos.forEach(function (v) {
        v.addEventListener('play', function () { pausedByVideo = true; });
        v.addEventListener('pause', function () { pausedByVideo = anyMainVideoPlaying(); });
        v.addEventListener('ended', function () { pausedByVideo = anyMainVideoPlaying(); });
      });

      measure();
      render();
      window.addEventListener('resize', measure);
      requestAnimationFrame(tick);
    })();

    // Logo click animation trigger
    (function () {
      var logo = document.querySelector('.sticky-topbar .brand img');
      if (!logo) return;
      var timer;
      logo.addEventListener('click', function () {
        logo.classList.remove('logo-click-anim'); // restart if already running
        void logo.offsetWidth; // reflow to reset animation
        logo.classList.add('logo-click-anim');
        clearTimeout(timer);
        timer = setTimeout(function () {
          logo.classList.remove('logo-click-anim');
        }, 700);
      });
    })();

    // Hero video: autoplay (muted) without controls, then unmute on first user interaction
    (function () {
      var heroVideo = document.querySelector('.hero-visual-video');
      if (!heroVideo) return;
      var playBtn = document.querySelector('.hero-video-play');
      var muteBtn = document.querySelector('.hero-video-mute');

      heroVideo.loop = true;
      heroVideo.controls = false;
      heroVideo.muted = false;
      heroVideo.volume = 1;
      heroVideo.playsInline = true;

      var tryPlay = heroVideo.play();
      if (tryPlay && typeof tryPlay.catch === 'function') {
        tryPlay.catch(function () {
          // Browser may block autoplay with sound; keep video running muted and unmute on first interaction.
          heroVideo.muted = true;
          heroVideo.play().catch(function () {});
        });
      }

      var unlocked = false;
      function unlockAudio() {
        if (unlocked) return;
        unlocked = true;
        heroVideo.muted = false;
        heroVideo.play().catch(function () {});
        document.removeEventListener('click', unlockAudio, true);
        document.removeEventListener('pointerdown', unlockAudio, true);
        document.removeEventListener('touchstart', unlockAudio, true);
        document.removeEventListener('keydown', unlockAudio, true);
        syncButtons();
      }
      document.addEventListener('click', unlockAudio, { once: true, capture: true });
      document.addEventListener('pointerdown', unlockAudio, { once: true, capture: true });
      document.addEventListener('touchstart', unlockAudio, { once: true, capture: true, passive: true });
      document.addEventListener('keydown', unlockAudio, { once: true, capture: true });

      function syncButtons() {
        if (playBtn) {
          var paused = heroVideo.paused || heroVideo.ended;
          playBtn.innerHTML = paused ? '<span>▶</span>' : '<span>❚❚</span>';
          playBtn.setAttribute('aria-label', paused ? 'Play video' : 'Pause video');
        }
        if (muteBtn) {
          var muted = heroVideo.muted;
          muteBtn.innerHTML = muted ? '<span>🔇</span>' : '<span>🔊</span>';
          muteBtn.setAttribute('aria-label', muted ? 'Unmute video' : 'Mute video');
        }
      }

      if (playBtn) {
        playBtn.addEventListener('click', function () {
          if (heroVideo.paused || heroVideo.ended) {
            heroVideo.play().catch(function () {});
          } else {
            heroVideo.pause();
          }
          syncButtons();
        });
      }

      if (muteBtn) {
        muteBtn.addEventListener('click', function () {
          heroVideo.muted = !heroVideo.muted;
          syncButtons();
        });
      }

      heroVideo.addEventListener('play', syncButtons);
      heroVideo.addEventListener('pause', syncButtons);
      heroVideo.addEventListener('volumechange', syncButtons);
      syncButtons();
    })();
