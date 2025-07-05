import {
    Ellipse,
    Group,
    PointerEvent,
    Line,
    DragEvent,
    type Frame,
    Bounds,
    type IPickResult,
    type ILeaf
} from "leafer-ui";
import "@leafer-in/find"
import { type Ref, ref, watch } from "vue";

export class ShotMarker {
    private readonly group: Group
    private point: { x: number; y: number };
    private frame: Frame
    private ranges: Group
    private scoreList: Ref<{
        id: number,
        score: number
    }[]>

    constructor(_frame: Frame, _point: { x: number, y: number }, _ranges: Group, _scoreList: Ref<{
        id: number,
        score: number
    }[]>, idx: number) {
        this.scoreList = _scoreList
        this.ranges = _ranges;
        this.point = _point
        this.frame = _frame
        this.group = new Group({
            zIndex: 999,
            fill:'transparent',
            data: {
                idx: idx.toString()
            },
            children: [
                new Ellipse({
                    width: 10,
                    height: 10,
                    x: this.point.x - 5,
                    y: this.point.y - 5,
                    fill: "gray",
                    strokeWidth: 0.5,
                    strokeAlign: 'inside',
                    stroke: {
                        type: 'solid',
                        color: '#fff'
                    },
                    zIndex: 998
                }),
                new Group({
                    zIndex: 1000,
                    id: 'active-bg',
                    fill: 'transparent',
                    visible: false,
                    children: [
                        new Ellipse({
                            width: 10,
                            height: 10,
                            x: this.point.x - 5,
                            y: this.point.y - 5,
                            fill: "green",
                            strokeWidth: 0.5,
                            strokeAlign: 'inside',
                            stroke: {
                                type: 'solid',
                                color: '#fff'
                            },
                            zIndex: 998
                        }),
                        new Ellipse({
                            width: 18,
                            height: 18,
                            x: this.point.x - 9,
                            y: this.point.y - 9,
                            fill: 'rgba(0,255,0,0.5)',
                            zIndex: 997
                        }),
                        new Ellipse({
                            width: 24,
                            height: 24,
                            x: this.point.x - 12,
                            y: this.point.y - 12,
                            fill: 'transparent',
                            strokeWidth: 0.5,
                            strokeAlign: 'inside',
                            stroke: {
                                type: 'solid',
                                color: '#fff'
                            },
                            zIndex: 996
                        }),
                        new Line({
                            width: 40,
                            x: this.point.x - 20,
                            y: this.point.y,
                            strokeWidth: 0.5,
                            stroke: '#fff',

                            zIndex: 995
                        }),
                        new Line({
                            width: 40,
                            x: this.point.x,
                            y: this.point.y - 20,
                            rotation: 90,
                            strokeWidth: 0.5,
                            stroke: '#fff',
                            zIndex: 995
                        })
                    ]
                })
            ]
        })

        this.initEvents()
    }

    private initEvents() {

        const currentEle = ref<string>()
        watch(currentEle, () => {
            // 除当前元素的其他元素全部恢复
            const arr = this.ranges.children.filter(x => x.id !== currentEle.value)
            arr.forEach(x => {
                const color = x.id?.split('-')[2]
                console.log(color)
                x.setAttr('fill', color)
            })
            // todo：震动一下，ios不支持此api
            window?.navigator?.vibrate?.(100);
        })
        // 长按可拖动
        this.group.on(PointerEvent.LONG_PRESS, (e) => {
            // 加偏移，防止手指遮挡
            // this.group.set({ offsetX: -10, offsetY: -10 })
            console.log(123123);
             // todo：震动一下，ios不支持此api
            window?.navigator?.vibrate?.(100);
            const eData = e.target.parent.data.idx
            console.log(eData);
            this.group.draggable = true
            console.log(this.group);
            // 显示出坐标
            const bg = this.group.children.find(x => x.id === 'active-bg') as Group
            
            
            if (bg) bg.visible = true

            // 碰撞检测
            this.group.on(DragEvent.DRAG, (e) => {
                const pick = this.ranges.pick({
                    // 加上偏移
                    // x: e.x - 10,
                    // y: e.y - 10,
                    x: e.x,
                    y: e.y,
                }, {
                    through: true
                }).target
                const color = pick.id?.split('-')[1]
                pick.setAttr('fill', color)
                // 更新分数
                const idx = this.scoreList.value.findIndex(x => x.id.toString() === eData)
                if (idx >= 0) {
                    this.scoreList.value[idx].score = parseInt(pick.id?.split('-')[0] || '0')
                }
                currentEle.value = pick.id
            })
        })

        // 松开禁用拖动
        this.group.on(PointerEvent.UP, (e) => {
            this.group.draggable = false
            const bg = this.group.children.find(x => x.id === 'active-bg') as Group
            if (bg) bg.visible = false

            // 恢复颜色
            console.log(currentEle.value);
            
            const arr = this.ranges.children.filter(x => x.id === currentEle.value)
            arr.forEach(x => {
                const color = x.id?.split('-')[2]
                console.log(color)
                // 5-#8ec5ff-#02abe2
                x.setAttr('fill', color)
            })
        })
    }

    // 获取封装的 group，可供外部添加到画布等
    public getGroup(): Group {
        return this.group
    }
}