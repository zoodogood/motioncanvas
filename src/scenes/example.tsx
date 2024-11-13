import { Layout, makeScene2D, Rect, Txt, View2D } from "@motion-canvas/2d";
import {
  createRef,
  debug,
  easeInOutCubic,
  map,
  tween,
} from "@motion-canvas/core";

const RECTS = 36;
const PER_RECT = to_radians(360 / RECTS);
const SIZE = 50;
const DISTANCE = (RECTS * 5) / (SIZE / 10) + 300;
const STRECHING_DISTANCE = DISTANCE;
const MOVE_PER_TICK = 3;

function to_radians(angle: number) {
  return angle * (Math.PI / 180);
}
function from_radians(angle: number) {
  return angle / (Math.PI / 180);
}
function mod(value: number, mod: number) {
  return value - (value % mod);
}
function createRect(view: View2D, item: number) {
  const rect = createRef<Rect>();
  view.add(
    <Rect
      ref={rect}
      size={SIZE}
      fill={`hsl(${from_radians(item * PER_RECT)}, 30%, 60%)`}
    />
  );
  const force_x = Math.cos(item * PER_RECT);
  const force_y = Math.sin(item * PER_RECT);

  return tween(0.5, (value) => {
    value = easeInOutCubic(value);
    rect().position.x(
      map(force_x * -STRECHING_DISTANCE, mod(force_x * DISTANCE, SIZE), value)
    );
    rect().position.y(
      map(force_y * -STRECHING_DISTANCE, mod(force_y * DISTANCE, SIZE), value)
    );
  });
}
export default makeScene2D(function* (view) {
  view.add(
    <Layout layout direction={"column"}>
      <Txt text={PER_RECT * RECTS + " 2Math.PI"} />
      <Txt text={Math.cos(PER_RECT * 0) + " Math.cos"} />
      <Txt text={Math.sin(PER_RECT * 0) + " Math.sin"} />
    </Layout>
  );

  const items = [...new Array(RECTS)].map((_, i) => i);

  const buffer: [View2D, number][] = [];
  const thread = tween(1, function (value) {
    value = easeInOutCubic(value) * RECTS - 1;
    if (!items.length) {
      return;
    }
    if (value < (items[MOVE_PER_TICK - 1] || items.at(-1))) {
      return;
    }

    buffer.push(
      ...items
        .splice(0, MOVE_PER_TICK)
        .map((item) => [view, item] as [View2D, number])
    );
  });

  for (const _ of thread) {
    yield;
    if (!buffer.length) {
      continue;
    }
  }

  //   // yield* all(
  //   //   ...buffer
  //   //     .splice(0, buffer.length)
  //   //     .map(([view, item]) => createRect(view, item))
  //   // );
  // yield* waitFor(7);
  debug("123");
});
