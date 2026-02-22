/**
 * 家用电器网站 - 图表交互逻辑
 * 支持流程图、序列图、状态图的交互功能
 */

// ========================================
// 流程图交互控制器
// ========================================
class FlowchartController {
    constructor(svgElementId) {
        this.svg = document.getElementById(svgElementId);
        this.nodes = [];
        this.connections = [];
        this.currentStep = 0;
        this.init();
    }

    init() {
        if (!this.svg) return;
        
        // 收集所有节点和连接
        this.nodes = Array.from(this.svg.querySelectorAll('.flowchart-node'));
        this.connections = Array.from(this.svg.querySelectorAll('.flowchart-arrow'));
        
        // 添加点击事件
        this.nodes.forEach((node, index) => {
            node.addEventListener('click', () => this.onNodeClick(index));
            node.style.cursor = 'pointer';
        });
        
        // 初始化动画
        this.setupAnimations();
    }

    onNodeClick(index) {
        this.highlightStep(index);
        this.showNodeDetail(index);
    }

    highlightStep(index) {
        // 清除之前的高亮
        this.nodes.forEach(node => {
            node.classList.remove('selected');
            node.classList.remove('node-highlighted');
        });
        
        // 高亮当前节点
        const node = this.nodes[index];
        if (node) {
            node.classList.add('selected');
            node.classList.add('node-highlighted');
        }
        
        this.currentStep = index;
    }

    showNodeDetail(index) {
        const node = this.nodes[index];
        const label = node.querySelector('.flowchart-label');
        if (label) {
            console.log('当前步骤:', label.textContent);
        }
    }

    setupAnimations() {
        // 为连接添加动画
        this.connections.forEach(conn => {
            conn.classList.add('signal-animated');
        });
    }

    // 播放流程动画
    playAnimation() {
        let step = 0;
        const interval = setInterval(() => {
            if (step >= this.nodes.length) {
                clearInterval(interval);
                return;
            }
            this.highlightStep(step);
            step++;
        }, 1000);
    }

    // 重置动画
    reset() {
        this.currentStep = 0;
        this.nodes.forEach(node => {
            node.classList.remove('selected');
            node.classList.remove('node-highlighted');
        });
    }
}

// ========================================
// 序列图交互控制器
// ========================================
class SequenceController {
    constructor(svgElementId) {
        this.svg = document.getElementById(svgElementId);
        this.messages = [];
        this.actors = [];
        this.init();
    }

    init() {
        if (!this.svg) return;
        
        // 收集所有消息和参与者
        this.messages = Array.from(this.svg.querySelectorAll('.sequence-message'));
        this.actors = Array.from(this.svg.querySelectorAll('.sequence-actor'));
        
        // 添加悬停交互
        this.messages.forEach((msg, index) => {
            msg.addEventListener('mouseenter', () => this.highlightMessage(index));
            msg.addEventListener('mouseleave', () => this.unhighlightMessage(index));
        });
    }

    highlightMessage(index) {
        const msg = this.messages[index];
        if (msg) {
            msg.style.stroke = 'var(--accent-color)';
            msg.style.strokeWidth = '3';
        }
        
        // 显示消息说明
        this.showMessageDetail(index);
    }

    unhighlightMessage(index) {
        const msg = this.messages[index];
        if (msg) {
            msg.style.stroke = '';
            msg.style.strokeWidth = '';
        }
    }

    showMessageDetail(index) {
        const msg = this.messages[index];
        const label = msg.nextElementSibling;
        if (label && label.classList.contains('sequence-label')) {
            console.log('消息:', label.textContent);
        }
    }

    // 播放序列动画
    playSequence() {
        let index = 0;
        const interval = setInterval(() => {
            if (index >= this.messages.length) {
                clearInterval(interval);
                return;
            }
            
            // 高亮当前消息
            this.messages.forEach((msg, i) => {
                msg.style.opacity = i === index ? '1' : '0.3';
            });
            
            index++;
        }, 800);
    }

    reset() {
        this.messages.forEach(msg => {
            msg.style.opacity = '1';
        });
    }
}

// ========================================
// 交互图控制器
// ========================================
class InteractiveDiagramController {
    constructor(svgElementId, options = {}) {
        this.svg = document.getElementById(svgElementId);
        this.nodes = [];
        this.connections = [];
        this.selectedNode = null;
        this.tooltip = null;
        this.options = {
            showTooltip: true,
            highlightConnections: true,
            ...options
        };
        this.init();
    }

    init() {
        if (!this.svg) return;
        
        // 创建提示框
        if (this.options.showTooltip) {
            this.createTooltip();
        }
        
        // 收集节点和连接
        this.nodes = Array.from(this.svg.querySelectorAll('.interactive-node'));
        this.connections = Array.from(this.svg.querySelectorAll('.interactive-connection'));
        
        // 绑定事件
        this.nodes.forEach(node => {
            node.addEventListener('click', (e) => this.onNodeClick(e, node));
            node.addEventListener('mouseenter', (e) => this.onNodeHover(e, node));
            node.addEventListener('mouseleave', () => this.onNodeLeave(node));
        });
    }

    createTooltip() {
        this.tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.tooltip.setAttribute('class', 'interactive-tooltip-group');
        this.tooltip.innerHTML = `
            <rect class="interactive-tooltip" width="150" height="40" x="0" y="0"/>
            <text class="interactive-tooltip-text" x="75" y="25" text-anchor="middle"></text>
        `;
        this.svg.appendChild(this.tooltip);
    }

    onNodeClick(event, node) {
        // 取消之前的选择
        if (this.selectedNode) {
            this.selectedNode.classList.remove('selected');
        }
        
        // 选择新节点
        node.classList.add('selected');
        this.selectedNode = node;
        
        // 高亮相关连接
        if (this.options.highlightConnections) {
            this.highlightRelatedConnections(node);
        }
        
        // 触发自定义事件
        this.emitEvent('nodeSelected', { node, id: node.getAttribute('data-id') });
    }

    onNodeHover(event, node) {
        if (this.options.showTooltip && this.tooltip) {
            const label = node.getAttribute('data-label') || node.querySelector('text')?.textContent || '';
            const tooltipRect = this.tooltip.querySelector('.interactive-tooltip');
            const tooltipText = this.tooltip.querySelector('.interactive-tooltip-text');
            
            tooltipText.textContent = label;
            
            const bbox = node.getBBox();
            this.tooltip.setAttribute('transform', `translate(${bbox.x + bbox.width + 10}, ${bbox.y - 20})`);
            this.tooltip.style.opacity = '1';
            tooltipRect.style.opacity = '1';
            tooltipText.style.opacity = '1';
        }
    }

    onNodeLeave(node) {
        if (this.tooltip) {
            this.tooltip.style.opacity = '0';
            const tooltipRect = this.tooltip.querySelector('.interactive-tooltip');
            const tooltipText = this.tooltip.querySelector('.interactive-tooltip-text');
            if (tooltipRect) tooltipRect.style.opacity = '0';
            if (tooltipText) tooltipText.style.opacity = '0';
        }
    }

    highlightRelatedConnections(node) {
        // 简单实现：高亮所有连接
        this.connections.forEach(conn => {
            conn.classList.add('active');
        });
    }

    emitEvent(eventName, data) {
        const event = new CustomEvent(`diagram:${eventName}`, { detail: data });
        this.svg.dispatchEvent(event);
    }

    // 获取选中的节点
    getSelectedNode() {
        return this.selectedNode;
    }

    // 重置选择
    reset() {
        if (this.selectedNode) {
            this.selectedNode.classList.remove('selected');
            this.selectedNode = null;
        }
        this.connections.forEach(conn => {
            conn.classList.remove('active');
        });
    }
}

// ========================================
// 状态图控制器
// ========================================
class StateDiagramController {
    constructor(svgElementId) {
        this.svg = document.getElementById(svgElementId);
        this.states = [];
        this.currentState = null;
        this.init();
    }

    init() {
        if (!this.svg) return;
        
        this.states = Array.from(this.svg.querySelectorAll('.state-node'));
        
        this.states.forEach(state => {
            state.addEventListener('click', () => this.transitionTo(state));
        });
    }

    transitionTo(stateElement) {
        // 清除之前的状态
        this.states.forEach(s => s.classList.remove('active'));
        
        // 设置新状态
        stateElement.classList.add('active');
        this.currentState = stateElement;
        
        // 触发自定义事件
        const stateId = stateElement.getAttribute('data-state-id');
        const event = new CustomEvent('stateChanged', { detail: { stateId } });
        this.svg.dispatchEvent(event);
    }

    getCurrentState() {
        return this.currentState;
    }

    // 自动播放状态转换
    playSequence(stateIds, interval = 1500) {
        let index = 0;
        const play = () => {
            if (index >= stateIds.length) {
                index = 0;
            }
            const state = this.states.find(s => 
                s.getAttribute('data-state-id') === stateIds[index]
            );
            if (state) {
                this.transitionTo(state);
            }
            index++;
            setTimeout(play, interval);
        };
        play();
    }
}

// ========================================
// 制冷循环动画控制器（冰箱专用）
// ========================================
class RefrigerationCycleController {
    constructor(svgElementId) {
        this.svg = document.getElementById(svgElementId);
        this.isAnimating = false;
        this.animationFrame = null;
        this.init();
    }

    init() {
        if (!this.svg) return;
        
        // 获取制冷剂流动路径
        this.flowPath = this.svg.querySelector('.refrigerant-flow');
        this.compressor = this.svg.querySelector('.compressor');
        this.condenser = this.svg.querySelector('.condenser');
        this.expansionValve = this.svg.querySelector('.expansion-valve');
        this.evaporator = this.svg.querySelector('.evaporator');
    }

    startAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        let offset = 0;
        const animate = () => {
            if (!this.isAnimating || !this.flowPath) {
                this.isAnimating = false;
                return;
            }
            
            offset = (offset + 2) % 100;
            this.flowPath.style.strokeDashoffset = offset;
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        animate();
    }

    stopAnimation() {
        this.isAnimating = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }

    toggleAnimation() {
        if (this.isAnimating) {
            this.stopAnimation();
        } else {
            this.startAnimation();
        }
    }
}

// ========================================
// 工具函数
// ========================================

// 初始化页面上所有的图表
function initAllDiagrams() {
    // 初始化流程图
    document.querySelectorAll('svg.flowchart').forEach(svg => {
        new FlowchartController(svg.id);
    });
    
    // 初始化序列图
    document.querySelectorAll('svg.sequence-diagram').forEach(svg => {
        new SequenceController(svg.id);
    });
    
    // 初始化交互图
    document.querySelectorAll('svg.interactive-diagram').forEach(svg => {
        new InteractiveDiagramController(svg.id);
    });
    
    // 初始化状态图
    document.querySelectorAll('svg.state-diagram').forEach(svg => {
        new StateDiagramController(svg.id);
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initAllDiagrams);

// 导出供外部使用
window.DiagramControllers = {
    FlowchartController,
    SequenceController,
    InteractiveDiagramController,
    StateDiagramController,
    RefrigerationCycleController,
    initAllDiagrams
};
