/**
 * 获取中点坐标
 * @param {object} a 第一个点坐标
 * @param {object} b 第二个点坐标
 * @returns
 */
function getCenter(a: { x: number; y: number }, b: { x: number; y: number }) {
  const x = (a.x + b.x) / 2;
  const y = (a.y + b.y) / 2;
  return { x: x, y: y };
}

/**
 * 获取两点间距离
 * @param {object} a 第一个点坐标
 * @param {object} b 第二个点坐标
 * @returns
 */
function getDistance(a: { x: number; y: number }, b: { x: number; y: number }) {
  const x = a.x - b.x;
  const y = a.y - b.y;
  return Math.hypot(x, y); // Math.sqrt(x * x + y * y);
}

export class FingerGestureUtils {
  isPointerdown = false; // 按下标识
  pointers: PointerEvent[] = []; // 触摸点数组
  point1 = { x: 0, y: 0 }; // 第一个点坐标
  point2 = { x: 0, y: 0 }; // 第二个点坐标
  diff = { x: 0, y: 0 }; // 相对于上一次pointermove移动差值
  lastPointermove = { x: 0, y: 0 }; // 用于计算diff
  lastPoint1 = { x: 0, y: 0 }; // 上一次第一个触摸点坐标
  lastPoint2 = { x: 0, y: 0 }; // 上一次第二个触摸点坐标
  lastCenter = { x: 0, y: 0 }; // 上一次中心点坐标
  dom!: HTMLElement;

  x = 0; // x轴偏移量
  y = 0; // y轴偏移量
  scale = 1; // 缩放比例
  maxScale = 3;
  minScale = 1;

  private callBack!: (x: number, y: number, scale: number) => void;

  addDomListener(
    dom: HTMLElement,
    callBack: (x: number, y: number, scale: number) => void
  ) {
    if (!dom || !callBack) {
      console.error(
        "【ZEGOCLOUD】call addDomListener: parameter dom and callBack are required"
      );
      return;
    }
    this.callBack = callBack;
    this.dom = dom;
    this.pointerDown();
    this.pointerMove();
    this.pointerUp();
    this.pointerCancel();
  }

  private pointerDown() {
    // 绑定 pointerdown
    this.dom.addEventListener("pointerdown", (e) => {
      this.pointers.push(e);
      this.point1 = {
        x: this.pointers[0].clientX,
        y: this.pointers[0].clientY,
      };
      this.lastPoint1 = {
        x: this.pointers[0].clientX,
        y: this.pointers[0].clientY,
      };
      if (this.pointers.length === 1) {
        this.isPointerdown = true;
        this.dom.setPointerCapture(e.pointerId);
        this.lastPointermove = {
          x: this.pointers[0].clientX,
          y: this.pointers[0].clientY,
        };
      } else if (this.pointers.length === 2) {
        this.point2 = {
          x: this.pointers[1].clientX,
          y: this.pointers[1].clientY,
        };
        this.lastPoint2 = {
          x: this.pointers[1].clientX,
          y: this.pointers[1].clientY,
        };
        this.lastCenter = getCenter(this.point1, this.point2);
      }
    });
  }

  private pointerMove() {
    // 绑定 pointermove
    this.dom.addEventListener("pointermove", (e) => {
      if (this.isPointerdown) {
        this.handlePointers(e, "update");
        const current1 = {
          x: this.pointers[0].clientX,
          y: this.pointers[0].clientY,
        };
        if (this.pointers.length === 1) {
          // 单指拖动查看图片
          this.diff.x = current1.x - this.lastPointermove.x;
          this.diff.y = current1.y - this.lastPointermove.y;
          this.lastPointermove = { x: current1.x, y: current1.y };
        } else if (this.pointers.length === 2) {
          const current2 = {
            x: this.pointers[1].clientX,
            y: this.pointers[1].clientY,
          };
          // 计算相对于上一次移动距离比例 ratio > 1放大，ratio < 1缩小
          let ratio =
            getDistance(current1, current2) /
            getDistance(this.lastPoint1, this.lastPoint2);
          // 缩放比例
          const _scale = this.scale * ratio;
          if (_scale > this.maxScale) {
            this.scale = this.maxScale;
            ratio = this.maxScale / this.scale;
          } else if (_scale < this.minScale) {
            this.scale = this.minScale;
            ratio = this.minScale / this.scale;
          } else {
            this.scale = _scale;
          }

          // 计算当前双指中心点坐标
          const center = getCenter(current1, current2);
          const origin = {
            x: (ratio - 1) * this.dom.clientWidth * 0.5,
            y: (ratio - 1) * this.dom.clientHeight * 0.5,
          };
          // 计算偏移量，认真思考一下为什么要这样计算(带入特定的值计算一下)
          this.x -=
            (ratio - 1) * (center.x - this.x) -
            origin.x -
            (center.x - this.lastCenter.x);
          this.y -=
            (ratio - 1) * (center.y - this.y) -
            origin.y -
            (center.y - this.lastCenter.y);

          this.lastCenter = { x: center.x, y: center.y };
          this.lastPoint1 = { x: current1.x, y: current1.y };
          this.lastPoint2 = { x: current2.x, y: current2.y };
        }
        this.callBack(this.x, this.y, this.scale);
      }
      e.preventDefault();
    });
  }

  private pointerUp() {
    // 绑定 pointerup
    this.dom.addEventListener("pointerup", (e) => {
      if (this.isPointerdown) {
        this.handlePointers(e, "delete");
        if (this.pointers.length === 0) {
          this.isPointerdown = false;
        } else if (this.pointers.length === 1) {
          this.point1 = {
            x: this.pointers[0].clientX,
            y: this.pointers[0].clientY,
          };
          this.lastPointermove = {
            x: this.pointers[0].clientX,
            y: this.pointers[0].clientY,
          };
        }
      }
    });
  }

  private pointerCancel() {
    // 绑定 pointercancel
    this.dom.addEventListener("pointercancel", (e) => {
      if (this.isPointerdown) {
        this.isPointerdown = false;
        this.pointers.length = 0;
      }
    });
  }

  /**
   * 更新或删除指针
   * @param {PointerEvent} e
   * @param {string} type
   */
  handlePointers(e: PointerEvent, type: "update" | "delete") {
    for (let i = 0; i < this.pointers.length; i++) {
      if (this.pointers[i].pointerId === e.pointerId) {
        if (type === "update") {
          this.pointers[i] = e;
        } else if (type === "delete") {
          this.pointers.splice(i, 1);
        }
      }
    }
  }
}
