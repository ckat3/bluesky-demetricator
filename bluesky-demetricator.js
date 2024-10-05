// ==UserScript==
// @name         Bluesky Demetricator
// @version      1.0.1
// @description  Removes likes and repost counts from Bluesky
// @match        *://*.bsky.app/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bsky.app
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    let css = `
        [data-testid="likeCount"],
        [data-testid="repostCount"],
        div:has(> [aria-label="Reposts of this post"]),
        div:has(> [aria-label="Likes on this post"])
        {
            display: none !important;
        }

        a[aria-label="Notifications"][role="tab"] div div
        {
          color: #0000 !important;
        }
        `;

    GM_addStyle(css);

    document.addEventListener('DOMContentLoaded', function() {
        const titleObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
				let new_title = document.title.replace(/^\([0-9]*\) /, "");
                if (new_title !== document.title) {
                    document.title = new_title;
                    return;
                }
            });
        });

        titleObserver.observe(document.querySelector('title'), {
            childList: true,
            subtree: true,
            characterData: true
        });

        // NOTIFICATIONS PAGE
        if (window.location.pathname.includes('/notifications')) {
            function hideNotifications() {
                let notifications = document.querySelectorAll('[data-testid|="feedItem-by"]');
                notifications.forEach(function(notification) {
                    let spans = notification.querySelectorAll('span');
                    spans.forEach(function(span) {
                        if (span.hasAttribute("data-tooltip")) {
							 // avoids matching inside the skeet (the timestamp has this attribute)
                            return;
                        }

                        if (span.textContent.endsWith("liked your post")) {
                            notification.style.display = "none";
                            return;
                        }
                    });
                });
            }

            const notificationObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    hideNotifications();
                });
            });

            notificationObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    });
})();
