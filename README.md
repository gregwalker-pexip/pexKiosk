# pexKiosk
Simple Pexip WebRTC sample code for a browser basedKiosk

Utilises vanilla html, javascript & CSS
Third party QR API for qr code generation for mobile remote pairing.  This could be incorporated locally

The WebRTC Kiosk use a API only connection utilis it enters a Pexip conference.  The mobile remote via api transfers the Kiosk to the correct meeting.  The remote provides audio mute and call-end via api (Host user).

Additional Work: 
1. A call timer could be implemented to provide automatic call disconnect after a set interval (e.g. 60 minutes)
2. Sometime the mobile remote browser needs to be refreshed (page swipe) after re-visiting same page.
