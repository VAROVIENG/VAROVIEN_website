const CACHE_NAME = "va-rovieng-v158";
const APP_SHELL = [
  "./",
  "./index.html",
  "./presentations.html",
  "./engineer.html",
  "./scientific-researcher.html",
  "./guiding-documents.html",
  "./images/scientific-researcher-01.png",
  "./images/scientific-researcher-02.png",
  "./styles.css",
  "./script.js",
  "./vendor/bootstrap-5.3.9/bootstrap.min.css",
  "./vendor/bootstrap-5.3.9/bootstrap.bundle.min.js",
  "./vendor/bootstrap-5.3.9/LICENSE",
  "./manifest.webmanifest",
  "./images/va-rovieng-logo-cropped.png",
  "./images/project-area-map.jpg",
  "./images/drilling-activities-01.png",
  "./images/drilling-activities-02.png",
  "./images/raw-material-from-machinery-drilling-02.png",
  "./images/raw-material-from-machinery-drilling-03.png",
  "./images/raw-material-from-machinery-drilling-04.png",
  "./images/raw-material-from-machinery-drilling-05.png",
  "./images/raw-material-from-machinery-drilling-06.png",
  "./images/raw-materials-01.png",
  "./images/raw-materials-02.png",
  "./images/raw-materials-03.png",
  "./images/raw-materials-04.png",
  "./images/raw-materials-05.png",
  "./images/hero-processing-equipment.png",
  "./images/hero-drill-core-samples.png",
  "./images/hero-mineral-sample.png",
  "./images/machinery-01.png",
  "./images/machinery-02.png",
  "./images/machinery-03.png",
  "./images/machinery-04.png",
  "./images/machinery-05.png",
  "./images/machinery-07.png",
  "./images/machinery-08.png",
  "./images/machinery-09.png",
  "./images/machinery-10.png",
  "./images/machinery-11.png",
  "./images/machinery-12.png",
  "./images/machinery-13.png",
  "./images/machinery-14.png",
  "./images/machinery-15.png",
  "./images/engineer-profile-01.png",
  "./images/engineer-profile-02.png",
  "./images/engineer-profile-03.png",
  "./images/engineer-profile-04.png",
  "./images/engineer-profile-2-01.png",
  "./images/engineer-profile-2-02.png",
  "./images/copper-sample.jpg",
  "./images/gold-sample.jpg",
  "./images/certificate-of-incorporation.png",
  "./images/patent-tax-2026.png",
  "./images/patent-tax-certificate.png",
  "./images/vat-registration-certificate.png",
  "./images/social-security-registration.png",
  "./images/enterprise-opening-declaration.png",
  "./images/va-rovieng-favicon-48.png",
  "./images/va-rovieng-icon-180.png",
  "./images/va-rovieng-icon-192.png",
  "./images/va-rovieng-icon-512.png",
  "./images/guiding-plan-01-cover.png",
  "./images/guiding-plan-02-template-guide.png",
  "./images/guiding-plan-03-contents.png",
  "./images/guiding-plan-04-executive-summary.png",
  "./images/guiding-plan-05-location-access.png",
  "./images/guiding-plan-06-geology-data.png",
  "./images/guiding-plan-07-history-assays.png",
  "./images/guiding-plan-08-objectives-work-programme.png",
  "./images/guiding-plan-09-environment-safety.png",
  "./images/guiding-plan-10-personnel-schedule.png",
  "./images/guiding-plan-11-indicative-budget.png",
  "./images/guiding-plan-12-monitoring-conclusion.png",
  "./images/guiding-plan-13-appendices.png",
];
const APP_SHELL_PATHS = new Set(
  APP_SHELL.map((path) => new URL(path, self.location.href).pathname),
);

self.addEventListener("install", (event) => {
  const appShellRequests = APP_SHELL.map(
    (path) => new Request(new URL(path, self.location.href), { cache: "reload" }),
  );

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(appShellRequests))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith("va-rovieng-") && cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  const networkResponse = fetch(event.request);
  const cacheUpdate = networkResponse.then(
    (response) => {
      if (
        response.ok &&
        response.type === "basic" &&
        APP_SHELL_PATHS.has(requestUrl.pathname)
      ) {
        return caches
          .open(CACHE_NAME)
          .then((cache) =>
            cache.put(new Request(event.request.url), response.clone()),
          );
      }
    },
    () => undefined,
  );
  event.waitUntil(
    cacheUpdate.catch((error) => {
      console.error("Service worker cache update failed:", error);
    }),
  );

  event.respondWith(
    networkResponse.catch((error) =>
      caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        throw error;
      }),
    ),
  );
});
