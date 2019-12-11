import * as React from 'react';

class LinearGauge extends React.Component {
	constructor(props) {
		super(props);
		//alwaysShowPercent - set to false then if the percent protected is smaller than 30 pixels it will not be shown
		//showUnprotectedPercent - set to false to not show the unprotected percent
		//targetAsLine - shows the target as a line - otherwise it is a grey rectangle
		this.state = { alwaysShowPercent: false, showUnprotectedPercent: false,targetAsLine:false };
	} 
	render() {
		let protectedWidth = 0; 
		let protectedHidden = true; 
		//the scaledWidth is the desired width of the LinearGauge
		let scaleFactor = this.props.scaledWidth / 100;
		//the number of pixels from the left hand side to offset the target line
		let targetPxOffset = (this.props.target_value * scaleFactor);
		//the number of pixels from the left hand side to the protected line
		protectedWidth = Math.round((this.props.protected_percent === -1) ? 0 : (this.props.protected_percent * scaleFactor));
		//protected percent text - if protected_percent < target_value then if the rounded protected_percent is the same as the rounded target_value, show the protected_percent to 1dp
		let protNum = this.props.protected_percent;
		let percentageProtectedText = (protNum < Number(this.props.target_value)) ? (Math.round(protNum)===Number(this.props.target_value)) ? String(protNum).slice(0,String(protNum).indexOf(".") + 2) : Math.round(protNum) : Math.round(protNum);
		//get whether or not the % protected should be visible or hidden
		protectedHidden = (protectedWidth < 26 && !(this.state.alwaysShowPercent));
		//get the width of the target shortfall
		let targetShortfallWidth = (this.props.protected_percent >= this.props.target_value) ? 0 : (targetPxOffset - protectedWidth);
		//if targetShortfallWidth is less than zero if causes the linear guage to go off-scale
		targetShortfallWidth = (targetShortfallWidth<0) ? 0 : targetShortfallWidth;
		//get the width of the rest of the bar
		let unprotectedWidth = (100 * scaleFactor) - protectedWidth - targetShortfallWidth;
		return (
			<div className={(this.props.visible) ? 'linearGauge' : 'linearGaugeNoBorder'} style={{opacity: (this.props.protected_percent === -1) ? '0.3' : 1}}>
				<div title={percentageProtectedText + '% protected'} className={'percentBar protectedPercentBar'} style={{width: protectedWidth + 'px'}}>{protectedHidden ? <span>&nbsp;</span> : percentageProtectedText + '%'}</div>
				<div title={'Target of ' + this.props.target_value + '%'} className={'percentBar targetShortfall'} style={{width: (this.props.visible) ? targetShortfallWidth + 'px' : '0px'}}></div>
				<div className={'percentBar totalShortFall'} style={{width: unprotectedWidth + 'px', color:'rgba(0,0,0,0.7)', 'textAlign': (this.props.visible) ? null : 'left', 'fontStyle': (this.props.visible) ? null : 'italic'}}>{(this.props.visible) ? null : 'Does not occur'}</div>
			</div>
		);
	}
}

export default LinearGauge;
