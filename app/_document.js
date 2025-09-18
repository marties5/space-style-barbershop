// Di _document.js (Next.js)
import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker.register('/sw.js').then(function (registration) {
                    console.log('Service Worker registration successful with scope: ', registration.scope);
                  }, function (err) {
                    console.log('Service Worker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

// <script>
//   if ('serviceWorker' in navigator){" "}
//   {window.addEventListener("load", function () {
//     navigator.serviceWorker
//       .register("/sw.js")
//       .then(function (registration) {
//         console.log("SW registered: ", registration);
//       })
//       .catch(function (registrationError) {
//         console.log("SW registration failed: ", registrationError);
//       });
//   })}
// </script>;
