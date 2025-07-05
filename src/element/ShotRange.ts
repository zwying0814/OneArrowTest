import {Ellipse, type Frame, Group, Line, PointerEvent} from "leafer-ui";
import {ShotMarker} from "./ShotMarker.ts";
import type {Ref} from "vue";

// 靶环配置
interface RingConfig {
    fill: string; // 填充颜色
    range: number; // 环数
    high:string; // 高亮色
}

export class ShotRange {
    private readonly group: Group
    private point: { x: number; y: number };
    private readonly targetCenter: Group
    private readonly rings: Ellipse[]
    private frame: Frame
    private scoreList:Ref<{
        id: number,
        score: number
    }[]>
    private dotIndex:number = 0

    constructor(_frame: Frame,_scoreList:Ref<{
        id: number,
        score: number
    }[]>) {
        this.frame = _frame
        this.scoreList = _scoreList
        this.point = {
            x: (_frame.width || 500) / 2,
            y: (_frame.height || 500) / 2,
        }
        this.targetCenter = this.createTargetCenter()
        this.rings = this.createTargetRings()
        this.group = new Group({
            children: [
                ...this.rings,
                this.targetCenter,
            ]
        })
        this.initEvents()
    }

    private initEvents() {
        this.group.on(PointerEvent.TAP, (e) => {
            const point = e.getPagePoint(this.group)
            const shotMark = new ShotMarker(this.frame,point,this.group,this.scoreList,++this.dotIndex)
            this.frame.add(shotMark.getGroup());
            const currentScore = parseInt(e.target.id.split('-')[0]) || 0;
            this.scoreList.value.push({
                id:this.dotIndex,
                score: currentScore,
            });
        })
    }

    private createTargetCenter() {
        return new Group({
            x: this.point.x,
            y: this.point.y,
            zIndex: 101,
            fill: 'transparent',
            around: 'center',
            id: '10',
            children: [
                new Ellipse({
                    width: 40 - 20,
                    height: 40 - 20,
                    fill: 'transparent',
                    around: 'center',
                    stroke: {
                        type: 'solid',
                        color: '#000'
                    },
                    id: '10',
                    strokeWidth: 0.5,
                    strokeAlign: 'inside',
                }),
                new Line({
                    width: 5,
                    strokeWidth: 0.5,
                    stroke: '#000',
                    around: 'center',
                    id: '10',
                }),
                new Line({
                    width: 5,
                    rotation: 90,
                    strokeWidth: 0.5,
                    stroke: '#000',
                    around: 'center',
                    id: '10',
                })
            ]
        })
    }

    private createTargetRings() {
        // 靶环配置（从内到外，一个一个环绘制，颜色两两相同）
        const ringConfigs: RingConfig[] = [
            {fill: '#fdc700',high:'#fff085', range: 10},
            {fill: '#fdc700',high:'#fff085', range: 9},
            {fill: '#ff6467',high:'#ffc9c9', range: 8},
            {fill: '#ff6467',high:'#ffc9c9', range: 7},
            {fill: '#02abe2',high:'#8ec5ff', range: 6},
            {fill: '#02abe2',high:'#8ec5ff', range: 5},
            {fill: '#000',high:'#314158', range: 4},
            {fill: '#000',high:'#314158', range: 3},
            {fill: '#fff',high:'#f5f5f4', range: 2},
            {fill: '#fff',high:'#f5f5f4', range: 1}
        ];

        return ringConfigs.map((config, idx) => {
            return new Ellipse({
                width: 40 * (idx + 1),
                height: 40 * (idx + 1),
                fill: config.fill,
                around: 'center',
                stroke: {
                    type: 'solid',
                    color: config.range === 4 ? '#fff' : '#000'
                },
                strokeWidth: 0.5,
                strokeAlign: 'inside',
                x: this.point.x,
                y: this.point.y,
                id: `${config.range.toString()}-${config.high}-${config.fill}`, // 顺带保存颜色
                zIndex: 100 - (idx + 1)
            });
        });
    }

    public getGroup(): Group {
        return this.group
    }
}