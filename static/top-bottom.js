(function() {
    "use strict";

    const collapseDonateBarCTA = document.getElementById("collapseDonateBarCTA"),
          donateBody = document.getElementsByClassName('donate__dropdown-body-wrap'),
          modalBody = document.getElementById("modal"),
          closeModal = document.getElementsByClassName("closeModal"),
          bodyFreezeClass = "dem__body--freeze";

    lightBox();
    collapseDonateBar();
    modal();

    function lightBox() {
        const lightbox = GLightbox({
            touchNavigation: true,
            loop: true,
            autoplayVideos: true,
            zoomable: false
        });
    }

    function collapseDonateBar() {
        if (!collapseDonateBarCTA) return;
        collapseDonateBarCTA.onclick = function() {
            console.log("hey");
            if (collapseDonateBarCTA.classList.contains("donate__toggle--close")) {
                donateBody[0].style.marginTop = '-' + (donateBody[0].scrollHeight) + 'px';
                collapseDonateBarCTA.classList.remove("donate__toggle--close")
                // display none needed for accessibility
                // this is a workaround to have an ease in and out
                setTimeout(() => {
                    donateBody[0].style.display = 'none';
                    // Create custom event to know when Donate Bar has been closed.
                    const event = new CustomEvent('donateHeaderCTAClosed');

                    // Dispatch the event.
                    collapseDonateBarCTA.dispatchEvent(event);
                }, 500);
            } else {
                collapseDonateBarCTA.classList.add("donate__toggle--close");
                donateBody[0].style.display = 'block';
                donateBody[0].style.marginTop = '0px';
            }

            //corrects height of block on window resize
            window.addEventListener('resize', function () {
                if (collapseDonateBarCTA.classList.contains('donate__toggle--close')) {
                    donateBody[0].style.marginTop = '0px';
                }
            });
        }
    }

    function modal() {
        if (modalBody) {
            document.body.classList.add(bodyFreezeClass);
            for (var i=0; i < closeModal.length; i++) {

                closeModal[i].addEventListener('click', function() {
                    document.body.classList.remove(bodyFreezeClass);
                    modalBody.style.display = "none";

                    // Create custom event to know when the Modal has been closed.
                    const event = new CustomEvent('modalClosed');

                    // Dispatch the event.
                    modalBody.dispatchEvent(event);
                });
        };
                window.onkeydown = function( event ) {
                    if ( event.keyCode == 27 ) {
                        document.body.classList.remove(bodyFreezeClass);
                        modalBody.style.display = "none";

                        // Create custom event to know when the Modal has been closed.
                        const event = new CustomEvent('modalClosed');

                        // Dispatch the event.
                        modalBody.dispatchEvent(event);
                    }
                };

        }
    }
})();
;
(function ($) {
  init();

  let $modal;
  let $donateCTA;
  let $donateCTAToggle;
  let $socialShareLink;
  let $copyTextButtons;

  const COOKIE_KEY_PREFIX = 'wp-dem-online-';
  const SESSION_KEY_PREFIX = 'wp-dem-online-';
  const DONATE_BAR_SESSION_KEY = 'donate-bar-closed';

  function setSessionStorage() {
    const donateBarSessionItem = getSessionItem(DONATE_BAR_SESSION_KEY);

    if (null !== donateBarSessionItem) {
      return;
    }

    setSessionItem(DONATE_BAR_SESSION_KEY, false);
  }

  function prepareUI() {
    const donateBarSessionItem = getSessionItem(DONATE_BAR_SESSION_KEY);

    // "Clicks" should only happen on load for pages without a modal/popup
    if (!donateBarSessionItem) {
      $donateCTAToggle.click();
    }
  }

  function bindEvents() {
    /**
     * Handle when the Modal element has been closed.
     */
    $modal.on('modalClosed', function () {
      setCookie('modal-closed', 'true', 1);
    });

    /**
     * Handle when the DonateBar element has been closed.
     */
    $donateCTA.on('donateBarCTAClosed', function () {
      const donateBarSessionItem = getSessionItem(DONATE_BAR_SESSION_KEY);

      if (donateBarSessionItem) {
        return;
      }

      setSessionItem(DONATE_BAR_SESSION_KEY, true);
    });

    $socialShareLink.on('click', function (e) {
      e.preventDefault();

      const $socialMediaLinkItem = $(this);
      const $socialShareItemWrap = $(this).closest('.social-share__item-wrap');
      const $imageDownloadLink = $(
        '.social-share__item-image-download-link',
        $socialShareItemWrap
      );

      // Download Image to User's machine.
      $imageDownloadLink[0].click();

      setTimeout(() => {
        window.open($socialMediaLinkItem.attr('href'), '_blank');
      }, 200);
    });

    $copyTextButtons.on('click', function (e) {
      e.preventDefault();

      const $copyButton = $(this);
      const $copyTextGridItem = $copyButton.closest(
        '.copy-text-to-clipboard__grid-item'
      );

      const $copyTextElement = $(
        '.copy-text-to-clipboard__grid-item-text',
        $copyTextGridItem
      );

      const $defaultStateTextElement = $(
        '.copy-text-to-clipboard__grid-item-copy-default-state',
        $copyTextGridItem
      );
      const $copiedStateTextElement = $(
        '.copy-text-to-clipboard__grid-item-copy-copied-state',
        $copyTextGridItem
      );

      const copyText = $copyTextElement.text();

      navigator.clipboard.writeText(copyText).then(console.log);

      $copyButton.addClass('copied');
      $defaultStateTextElement.hide();
      $copiedStateTextElement.show();

      setTimeout(() => {
        $copyButton.removeClass('copied');
        $copiedStateTextElement.hide();
        $defaultStateTextElement.show();
      }, 1500);
    });
  }

  /**
   * Set cookie based on passed in key, value and expiration (in days).
   *
   * @param {string} key
   * @param {string} value
   * @param {number} expiry
   */
  function setCookie(key, value, expiry) {
    const expires = new Date();

    expires.setTime(expires.getTime() + expiry * 5 * 60 * 1000);

    document.cookie =
      COOKIE_KEY_PREFIX +
      key +
      '=' +
      value +
      ';expires=' +
      expires.toUTCString() +
      ';path=/';
  }

  /***
   * Retrieve cookie from `document.cookie` based on passed on key.
   *
   * @param {string} key
   * @return {string}
   */
  function getCookie(key) {
    if (0 === document.cookie.length) {
      return '';
    }

    let cookieStartIndex = document.cookie.indexOf(key + '=');

    if (-1 === cookieStartIndex) {
      return '';
    }

    cookieStartIndex = cookieStartIndex + key.length + 1;
    let cookieEndIndex = document.cookie.indexOf(';', cookieStartIndex);

    if (-1 === cookieEndIndex) {
      cookieEndIndex = document.cookie.length;
    }

    return decodeURIComponent(
      document.cookie.substring(cookieStartIndex, cookieEndIndex)
    );
  }

  /**
   * A setter function for setting an item in `sessionStorage`
   *
   * @param {string} key
   * @param {*} value
   */
  function setSessionItem(key, value) {
    sessionStorage.setItem(SESSION_KEY_PREFIX + key, value);
  }

  /**
   * A getter function for retrieving an item from `sessionStorage`
   *
   * @param {string} key
   *
   * @return {*|null}
   */
  function getSessionItem(key) {
    const sessionItem = sessionStorage.getItem(SESSION_KEY_PREFIX + key);

    if ('false' === sessionItem) {
      return false;
    }

    if ('true' === sessionItem) {
      return true;
    }

    return sessionItem;
  }

  function init() {
    $(window).on('load', function () {
      $modal = $('#modal');
      $donateCTA = $('#donateBarBody');
      $donateCTAToggle = $('#collapseDonateBarCTA');
      $socialShareLink = $('.social-share__list-item-link');
      $copyTextButtons = $('.copy-text-to-clipboard__grid-item-copy-button');

      setSessionStorage();
      prepareUI();
      bindEvents();
    });
  }



  $("details").removeAttr('open');
  function openDivUnderAnchor(name) {

    if (name !== '') {
      //name = name.replace('#','');
      $(name + " details").attr('open', '');
    }
  }

  $(document).ready(function () {
    var hash = $(location).attr('hash');

    // opens the correct div if its link is clicked
    $(document).on('click', 'a', function () {
      openDivUnderAnchor($(this).attr('href'));
    });
    // opens the correct div if its anchor is specified in the URL
    openDivUnderAnchor(location.hash);

    $('.chat-header-container').click(function () {
      $('.chatbox-settings').toggleClass('chat-hidden');
      $('.chatbox-main').addClass('chat-hidden');
      if ($('.darkmode').is(':checked')) {
        $('.chatbox-settings .chat-profile.db').show();
        $('.chatbox-settings .chat-profile:not(.db)').hide();
      }
      else {
        $('.chatbox-settings .chat-profile.db').hide();
        $('.chatbox-settings .chat-profile:not(.db)').show();
      }
    });

    $('.darkmode').click(function () {

      $('.chatbox-settings').toggleClass('chat-hidden');
      if ($('.darkmode').is(':checked')) {
        //$('.chatbox').toggleClass('darkbrandon');
        $('.darkbrandon').toggleClass('chat-hidden');
        $('.chatbox').addClass('db');
        $('.chat-message p').addClass('db');

      }
      else {
        $('.darkbrandon').addClass('chat-hidden');
        $('.chatbox-main:not(.darkbrandon)').toggleClass('chat-hidden');
        $('.chatbox').removeClass('db');
        $('.chat-message p').removeClass('db');
      }
      chatAnimation();

    });
    $('.chat-back').click(function () {
      $('.chatbox-settings').toggleClass('chat-hidden');
      if ($('.darkmode').is(':checked')) {
        //$('.chatbox').toggleClass('darkbrandon');
        $('.darkbrandon').toggleClass('chat-hidden');
        $('.chatbox').addClass('db');
        $('.chat-message p').addClass('db');

      }
      else {
        $('.darkbrandon').addClass('chat-hidden');
        $('.chatbox-main:not(.darkbrandon)').toggleClass('chat-hidden');
        $('.chatbox').removeClass('db');
        $('.chat-message p').removeClass('db');
      }
    });
    $('.chat-message p').hide();
    $('.chat-donate').hide();

    function chatAnimation() {
      if ($('.chat-message p').is(":visible")) {
        console.log('already ran');
        return;
      }
      else if ($('p.db').is(":visible")) {
        console.log('already ran');
        return;
      }
      else if ($('div').is('.chatbox.db')) {
        var db = "div.darkbrandon ";
        var darkmessages = ".db";
        console.log('db mode');
      }
      else {
        var db = ".chatbox-main:not(.darkbrandon) ";
        var darkmessages = "";
        console.log('NOT db mode');
      }


      $(db + '.chat-message p').each(function (i, obj) {
        var chat_array1 = $(db + '.chat-message p').length;
        console.log(chat_array1);

        setTimeout(function () {
          $('<div class="bubbles"><span class="dots"></span><span class="dots"></span><span class="dots"></span></div>').insertBefore(obj);
          $(obj).delay(1000).fadeIn(400);
          $('.bubbles').delay(1000).hide(0);

          //var objPos = $(obj).position().top;
          // var objOff = $('.chat-body p:nth-child('+i+')').offset().top + $('.chat-body p:nth-child('+i+')').outerHeight(true) + 40;
          // var chatwindow = $('.chat-window').height();


          var chat = document.getElementsByClassName("chat-window");
          chat[0].scrollIntoView({ behavior: "smooth", block: "end" });

          if ((i + 1) === chat_array1) {
            var donateButton = $(db + ' .chat-donate');
            $(donateButton).delay(1000).fadeIn(400);

            var donatePos = $(donateButton).offset().top + $(donateButton).outerHeight(true) + 400;
            $('.chat-body').delay(2000).animate({
              scrollTop: donatePos
            });

            return;
          }

        }, 2000 * i);


      });
    }

    $('.chat-icons .close').click(function () {
      $('.chatbox').hide();
      $('.chat-min').show();
    });

    $('.chat-icons .min').click(function () {

      if ($('.chatbox').is('.db')) {
        $('.dbprofile').show();
        $('.jbProfile').hide();
      }
      else {
        $('.dbprofile').hide();
        $('.jbProfile').show();
      }

      $('.chatbox').hide();
      $('.chat-min').show();
      $('.chat-min .chat-start').hide();

    });
    $('.chat-icons .close').click(function () {
      $('.chat-min').hide();
      // setCookie('chat-closed', 'true', time()+3600);
      document.cookie('chat-closed', 'true', { secure: true });
    });

    /*
    $('.chat-min').click(function () {
      $('.chatbox').show();
      $('.chat-min').hide();
      $('.chat-min .chat-start').hide();
      chatAnimation();
    });*/
    //For AB test
    $('.chat-min .message').click(function () {
      $('.chatbox').show();
      $('.chat-min').hide();
      $('.chat-min .chat-start').hide();
      chatAnimation();
    });
    $('.chat-min .chat-start .chat-intro').click(function () {
      $('.chatbox').show();
      $('.chat-min').hide();
      $('.chat-min .chat-start').hide();
      chatAnimation();
    });

    $('.chat-min .chat-start .read').click(function () {
      $('.chatbox').show();
      $('.chat-min').hide();
      $('.chat-min .chat-start').hide();
      chatAnimation();
    });
    $('.chat-icons .close').click(function () {
      $('.chat-min').hide();
      $('.chat-min-container').hide();
    });
    $('.chat-start .close').click(function () {
      $('.chat-min').hide();
      $('.chat-min-container').hide();
    });
    if ($('#modal').is(':visible')) {
      $('.closeModal').click(function () {
        setTimeout(function () {
          $('.chat-min .chat-start').fadeIn(200);
        }, 2000);
      })
    }
    else {
      setTimeout(function () {
        $('.chat-min .chat-start').fadeIn(200);
      }, 1200);
    }
  });

  ///JQuery for optimizely test//
  $('.chat-buttons .close').click(function () {
    $('.chat-start').hide();
  });
  $('.chat-buttons .read').click(function () {
    $('.chatbox').show();
    $('.chat-min').hide();
    $('.chat-min .chat-start').hide();
  });

  $('.menu-open').click(function () {
    $('.mobile-menu').show();
    $('body').addClass('freeze');
  });

  $('.closeMenu').click(function () {
    $('.mobile-menu').hide();
    $('body').removeClass('freeze');
  });



})(jQuery);
;
