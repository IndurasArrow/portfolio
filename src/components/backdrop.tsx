/**
 * A film grain over the page background, under the particle swarm and the
 * content. (There used to be a soft light following the pointer here too;
 * the swarm does the lighting now, and two light sources fought.)
 */
export default function Backdrop() {
  return <div aria-hidden="true" className="backdrop-grain" />;
}
