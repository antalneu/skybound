/**
 * Site-wide atmospheric backdrop.
 *
 * Two fixed layers behind everything: a slow-drifting gradient wash and a
 * fine grain overlay. All the work is in CSS (see `.atmosphere` / `.grain` in
 * index.css) because only `transform` animates, which keeps it on the
 * compositor and off the main thread.
 *
 * Deliberately not WebGL. The brief allowed a Three.js shader as a stretch;
 * a shader canvas running site-wide would compete for GPU with the Explorer's
 * map and particle field, which is where the frame budget actually matters.
 */
export default function Atmosphere() {
  return (
    <>
      <div className="atmosphere" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
    </>
  )
}
