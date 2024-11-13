import { Layout, makeScene2D, Rect, Txt, View2D } from "@motion-canvas/2d";
import {
  all,
  createRef,
  easeInOutCubic,
  easeInQuint,
  easeOutQuint,
  linear,
  map,
  tween,
  waitFor,
} from "@motion-canvas/core";

function my_ease_in_out(value: number) {
  const { min } = Math;
  const linear_ = linear(value) * 0.5;
  const starts = min(easeOutQuint(value * 4), 0.25);
  const ends = value > 0.75 ? min(easeInQuint((value - 0.75) * 4), 0.25) : 0;
  return linear_ + starts + ends;
}

const rects_count = 144;
const rect_size = 30;
const rects_gap = to_radians(360 / rects_count);
const radius = (rects_count * 5) / (rect_size / 10) + 300;
// Дальность появления от центра
const rect_appearance_spring = radius;
const rects_at_time = 3;
const duration_of_queue = rects_count / 12; /* Seconds */

function to_radians(angle: number) {
  return angle * (Math.PI / 180);
}
function from_radians(angle: number) {
  return angle / (Math.PI / 180);
}
function truncate(value: number, mod: number) {
  return value - (value % mod);
}
function createRect(view: View2D, item: number, duration: number) {
  const rect = createRef<Rect>();
  view.add(
    <Rect
      ref={rect}
      size={rect_size}
      fill={`hsl(${from_radians(item * rects_gap)}, 30%, 60%)`}
    />
  );
  const force_x = Math.cos(item * rects_gap);
  const force_y = Math.sin(item * rects_gap);

  /* min duration */
  duration += 1 /* Second */ / 20 /* frames */;

  return tween(duration, (value) => {
    value = easeInOutCubic(value);
    rect().position.x(
      map(
        force_x * -rect_appearance_spring,
        truncate(force_x * radius, rect_size),
        value
      )
    );
    rect().position.y(
      map(
        force_y * -rect_appearance_spring,
        truncate(force_y * radius, rect_size),
        value
      )
    );
  });
}
export default makeScene2D(function* (view) {
  view.add(
    <Layout layout direction={"column"}>
      <Txt text={rects_gap * rects_count + " 2Math.PI"} />
      <Txt text={Math.cos(rects_gap * 0) + " Math.cos"} />
      <Txt text={Math.sin(rects_gap * 0) + " Math.sin"} />
    </Layout>
  );

  yield;

  const groups = [...new Array(rects_count / rects_at_time)]
    .map(
      (_, i) =>
        [my_ease_in_out(i / (rects_count / rects_at_time)), i] as [
          number,
          number
        ]
    )
    .reduce((acc, [timeline, group_index], i, array) => {
      const previous_timeline = array[i - 1]?.[0] ?? 0;

      const group = [...new Array(rects_at_time)].map(
        (_, i) => group_index * rects_at_time + i
      );
      return acc.concat([[timeline - previous_timeline, group]]);
    }, [] as [number, number[]][]);

  for (const [timeline, group] of groups) {
    yield* waitFor((timeline * duration_of_queue) / rects_at_time);
    yield* all(
      ...group.map((item) =>
        createRect(view, item, timeline * duration_of_queue)
      )
    );
  }

  yield* waitFor(2);
});
