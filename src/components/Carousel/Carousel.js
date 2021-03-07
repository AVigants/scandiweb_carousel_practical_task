import React, { Component } from 'react'
import "./Carousel.css"


class Carousel extends Component {
    state = {
        sliderStyles: {
            width: `${this.props.children.length * 100}%`,
            transform: ``,
            transition: `all 0.3s`
        },
        carouselStyles: {
            justifyContent: `flex-start`
        },
        children: this.props.children
    }

    panel = React.createRef()
    //variable declaration:
    transitionEnd = true
    direction = -1
    selectedPanel = 0
    MultiplePanelsToSkip = null
    areGesturesEnabled = true
    gestureStartPos = null
    isHandleTransitionEndDisabled = false

    handleArrowSelect = (direction) => {  //handle arrow click events (prev, next)
        this.disableGestures()
        this.loadContent(direction)
        this.translate(direction)
    }

    handleIndexSelect = (index) => { //handle index (.controls > ul > li) click events
        if (this.selectedPanel === index) {
            return
        }
        this.disableGestures()
        let deltaPanels = (this.selectedPanel - index); //calculate the difference between the current panel, and the panel the user wants to skip to
        this.loadContent(Math.sign(deltaPanels))
        this.translate(deltaPanels)

        if (deltaPanels > 1 || deltaPanels < -1) {
            this.MultiplePanelsToSkip = deltaPanels;
        }
    }

    gestureStart = (e) => { //swipe start (mousedown, touchdown, pointerdown)
        if (!this.areGesturesEnabled) {
            return
        }
        this.gestureStartPos = e.pageX
    }
    gestureMove = (e) => { //swipe move (mousemove, touchmove, pointermove)
        if (!this.areGesturesEnabled || !this.gestureStartPos) {
            return
        }
        let deltaX = e.pageX - this.gestureStartPos

        this.loadContent(Math.sign(deltaX))

        const sliderStylesCopy = { ...this.state.sliderStyles }
        sliderStylesCopy['transition'] = `none`
        this.setState({ sliderStyles: sliderStylesCopy })

        sliderStylesCopy['transform'] = `translate(${deltaX}px)`
        this.setState({ sliderStyles: sliderStylesCopy })



    }
    gestureEnd = (e) => {   //swipe end (mouseup, touchup, pointerup)
        if (!this.areGesturesEnabled || !this.gestureStartPos) {
            return
        }
        this.disableGestures()
        let deltaX = e.pageX - this.gestureStartPos

        const sliderStylesCopy = { ...this.state.sliderStyles }
        sliderStylesCopy['transition'] = `all 0.3s`
        this.setState({ sliderStyles: sliderStylesCopy })

        if (deltaX > this.panel.current.offsetWidth / this.state.children.length ||
            deltaX < this.panel.current.offsetWidth / this.state.children.length * -1) { // if deltaX is more than 1/4 of the panel's width, then it is a valid swipe
            sliderStylesCopy['transform'] = `translate(${Math.sign(deltaX) * 100 / this.state.children.length}%)`
            this.setState({ sliderStyles: sliderStylesCopy })
        } else {
            sliderStylesCopy['transform'] = `translate(0)`
            this.setState({ sliderStyles: sliderStylesCopy })
            this.disableTransitionEndEvent()
        }
        this.gestureStartPos = null

    }
    enableGestures = () => {
        this.areGesturesEnabled = true
    }
    disableGestures = () => {
        this.areGesturesEnabled = false
    }
    disableTransitionEndEvent = () =>{
        this.transitionEnd = false
    }
    enableTransitionEndEvent = () =>{
        this.transitionEnd = true
    }


    append = (numOfPanels = 1) => {
        let childrenCopy = [...this.state.children] //make a copy
        for (let i = 0; i < numOfPanels; i++) {
            childrenCopy.push(childrenCopy.shift()) //take the first element and add it to the end of the arr
        }
        this.setState({ children: childrenCopy }) //the altered array is now this.state.children which gets rendered to the dom
    }

    prepend = (numOfPanels = 1) => {
        let childrenCopy = [...this.state.children] //make a copy
        for (let i = 0; i < numOfPanels; i++) {
            childrenCopy.unshift(childrenCopy.pop()) //take the last element and add it to the start of the arr
        }
        this.setState({ children: childrenCopy }) //the altered array is now this.state.children which gets rendered to the dom
    }
    loadContent = (value) => {
        if (value === 0 || Math.sign(value) === this.direction) { //if value is 0 or value is the same as the direction, then we already have content in that direction we want to swipe
            return
        }
        if (Math.sign(value) === 1) {
            this.append() //append data
            this.direction = 1;
            const newCarouselStyles = { ...this.state.carouselStyles } //set to flex-end
            newCarouselStyles['justifyContent'] = `flex-end`;
            this.setState({ carouselStyles: newCarouselStyles })
        } else {
            this.prepend() //prepend data 
            this.direction = -1;
            const newCarouselStyles = { ...this.state.carouselStyles } //set to flex-start
            newCarouselStyles['justifyContent'] = `flex-start`;
            this.setState({ carouselStyles: newCarouselStyles })
        }

    }
    translate = (direction, amount = (100 / this.state.children.length), units = '%') => {
        const sliderStylesCopy = { ...this.state.sliderStyles } //make a copy
        sliderStylesCopy['transform'] = `translate(${direction * amount}${units})`
        this.setState({ sliderStyles: sliderStylesCopy })
    }

    handleTransitionEnd = () => {
        if (!this.transitionEnd) {
            this.enableTransitionEndEvent()
            this.enableGestures()
            return
        }
        if (this.MultiplePanelsToSkip) { //if an index was selected that requires to skip more than 1 panel
            if (Math.sign(this.MultiplePanelsToSkip) === -1) {//forward (left to right)
                this.append(this.MultiplePanelsToSkip * -1); //turn MultiplePanelsToSkip into a positive number
                this.selectedPanel = this.selectedPanel - this.MultiplePanelsToSkip;
            } else if (Math.sign(this.MultiplePanelsToSkip) === 1) {//backward (right to left)
                this.prepend(this.MultiplePanelsToSkip);
                this.selectedPanel = this.selectedPanel - this.MultiplePanelsToSkip;
            }
            this.MultiplePanelsToSkip = null
        } else {    //we want to go forwards or backwards by 1 panel 
            if (this.direction === -1) {
                this.append()
                //selected panel increment
                if (this.selectedPanel === this.state.children.length - 1) { //if this is the last panel...
                    this.selectedPanel = 0  //jump to the first panel 
                } else {
                    this.selectedPanel++; //inc by 1
                }

            } else {
                this.prepend()
                //selected panel decrement
                if (this.selectedPanel === 0) { //if this is the first panel...
                    this.selectedPanel = this.state.children.length - 1;    //jump to the last panel
                } else {
                    this.selectedPanel--; //dec by 1
                }
            }
        }

        //Set sliderStyles transition to 'none'
        const sliderStylesCopy = { ...this.state.sliderStyles }
        sliderStylesCopy['transition'] = `none`
        this.setState({ sliderStyles: sliderStylesCopy })
        //move (transform) slider to 0px
        sliderStylesCopy['transform'] = `translate(0)`
        this.setState({ sliderStyles: sliderStylesCopy })
        //reset transition to 'all 0.3s'
        setTimeout(() => {
            const resetSliderStyles = { ...this.state.sliderStyles }
            resetSliderStyles['transition'] = `all 0.3s`
            this.setState({ sliderStyles: resetSliderStyles })
        });

        this.enableGestures()
    }



    render() {

        return (
            <div className="Carousel" style={this.state.carouselStyles}>
                <div className="slider"
                    style={this.state.sliderStyles}
                    onTransitionEnd={() => this.handleTransitionEnd()}>
                    {this.state.children.map((el, index) => {
                        return (
                            <div className="panel"
                                key={index}
                                ref={this.panel}
                                onMouseDown={(e) => this.gestureStart(e)}
                                onMouseMove={(e) => this.gestureMove(e)}
                                onMouseUp={(e) => this.gestureEnd(e)}>
                                {el}
                            </div>
                        )
                    })}
                </div>
                <div className="controls">
                    <button className="arrow prev"
                        onClick={() => {
                            this.handleArrowSelect(1)
                        }}>
                        prev
                    </button>
                    <button className="arrow next"
                        onClick={() => {
                            this.handleArrowSelect(-1)
                        }}>
                        next
                    </button>
                    <ul>
                        {this.props.children.map((el, index) => {
                            return (
                                <li key={index}
                                    className={this.selectedPanel === index ? 'selected' : null}
                                    onClick={() => this.handleIndexSelect(index)} />
                            )
                        })}
                    </ul>

                </div>
            </div>
        )
    }
}


export default Carousel