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
      var prevBtn = document.querySelector('.reviews-prev');
      var nextBtn = document.querySelector('.reviews-next');
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
          video: './assets/Soap_Customer(Lakshmi) 1.mp4',
          videoClass: 'portrait-focus'
        },
        {
          person: 'Karthik | Customer',
          title: 'Fresh homemade products nearby.',
          body: "I was looking for fresh, homemade dosa dough. I found a lady selling it just a few streets away on Mobitrons. I was able to call her through the app to confirm, and the flour was so fresh. It's great to support local people.",
          video: './assets/Food_Customer_2 1.mp4',
          videoClass: 'portrait-focus'
        }
      ];

      function slideHtml(item) {
        return '<div class="review-slide">'
          + '<article class="testimonial-media lp-story-card" aria-label="Video testimonial">'
          + '<video class="testimonial-video' + (item.videoClass ? ' ' + item.videoClass : '') + '" width="480" height="260" controls preload="none" playsinline>'
          + '<source data-src="' + item.video + '" type="video/mp4" />'
          + '</video>'
          + '<button type="button" class="testimonial-play-btn" aria-label="Play testimonial video">&#9658;</button>'
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

      function setupVideoPlayButtons() {
        var mediaCards = track.querySelectorAll('.testimonial-media');
        mediaCards.forEach(function (card) {
          var video = card.querySelector('.testimonial-video');
          var playBtn = card.querySelector('.testimonial-play-btn');
          if (!video || !playBtn) return;

          function syncState() {
            var isPlaying = !video.paused && !video.ended;
            card.classList.toggle('is-playing', isPlaying);
          }

          playBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            video.play().catch(function () {});
          });

          video.addEventListener('play', syncState);
          video.addEventListener('pause', syncState);
          video.addEventListener('ended', syncState);
          syncState();
        });
      }
      setupVideoPlayButtons();

      var index = 1;
      var locked = false;
      var autoTimer = null;
      var dragStartX = 0;
      var dragging = false;

      function setPos(animate) {
        track.style.transition = animate ? 'transform 1400ms cubic-bezier(.22,1,.36,1)' : 'none';
        track.style.transform = 'translateX(' + (-index * 100) + '%)';
      }

      // Lazy-load only current/neighbor videos to reduce initial payload on deployed site.
      function hydrateSlideVideo(slideEl) {
        if (!slideEl) return;
        var video = slideEl.querySelector('video');
        if (!video) return;
        var source = video.querySelector('source');
        if (!source) return;
        if (!source.getAttribute('src')) {
          var lazySrc = source.getAttribute('data-src');
          if (lazySrc) {
            source.setAttribute('src', lazySrc);
            video.load();
          }
        }
      }

      function preloadNearbySlides() {
        hydrateSlideVideo(track.children[index]);
        hydrateSlideVideo(track.children[index + 1]);
        hydrateSlideVideo(track.children[index - 1]);
      }

      function pauseWhenPlaying() {
        var activeSlide = track.children[index];
        var activeVideo = activeSlide ? activeSlide.querySelector('video') : null;
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
        preloadNearbySlides();
        locked = false;
      });

      function startAuto() {
        stopAuto();
        autoTimer = setInterval(function () {
          if (pauseWhenPlaying()) return;
          next();
        }, 4200);
      }

      function stopAuto() {
        if (autoTimer) clearInterval(autoTimer);
        autoTimer = null;
      }

      carousel.addEventListener('wheel', function (e) {
        e.preventDefault();
        stopAuto();
        if (e.deltaY > 0 || e.deltaX > 0) next();
        else prev();
        startAuto();
      }, { passive: false });

      if (prevBtn) {
        prevBtn.addEventListener('click', function () {
          stopAuto();
          prev();
          startAuto();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          stopAuto();
          next();
          startAuto();
        });
      }

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
      preloadNearbySlides();
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

    // Hero video should stay paused on first load
    (function () {
      var heroVideo = document.querySelector('.hero-visual-video');
      var heroSection = document.getElementById('hero');
      if (!heroVideo) return;

      heroVideo.loop = true;
      heroVideo.controls = true;
      heroVideo.muted = false;
      heroVideo.volume = 1;
      heroVideo.playsInline = true;
      heroVideo.pause();
      heroVideo.currentTime = 0;

      // Auto-pause hero video when user scrolls past the hero section.
      if (heroSection && 'IntersectionObserver' in window) {
        var heroObserver = new IntersectionObserver(function (entries) {
          var entry = entries[0];
          if (!entry) return;
          if (entry.intersectionRatio < 0.35 && !heroVideo.paused && !heroVideo.ended) {
            heroVideo.pause();
          }
        }, { threshold: [0, 0.35, 1] });
        heroObserver.observe(heroSection);
      }
    })();
