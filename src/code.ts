figma.showUI(__html__, { themeColors: true, width: 500, height: 300 });

let data,
	bars,
	size,
	width,
	height,
	leftMargin,
	ticks,
	showYAxis,
	showHeader,
	showValues;

// define colours: black, white, gray, blue
const black = [
	{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }
];
const white = [
	{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }
];
const gray = [
	{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }
];
const blue = [
	{ type: 'SOLID', color: { r: 0, g: 0.5, b: 1 } }
];

let chartPadding = {
	top: 24,
	right: 24,
	bottom: 24,
	left: 24
}, chartSpacing = 24,
	headerSpacing = 8;

let titleSize = 24,
	subtitleSize = 16,
	labelSize = 12,
	valueSize = 14;

let columnSpacing = 8;

let maxBarWidth = 48,
	barContainerPadding = {
		right: 4,
		left: 4
	},
	barPadding = {
		top: 8,
		right: 4,
		bottom: 8,
		left: 4
	};

const drawChart = async () => {
	await figma.loadFontAsync({ family: "Inter", style: "Regular" });
	await figma.loadFontAsync({ family: "Inter", style: "Bold" });

	// get the max value in the data
	const max = Math.max(...data.map(d => d[size]));
	console.log(max);

	// create new nodes
	const nodes: SceneNode[] = [];
	const chart = figma.createFrame();
	chart.name = 'Chart';

	// resize chart node using specified width
	chart.resizeWithoutConstraints(width, 300);

	// set to autolayout with spacing and padding
	chart.layoutMode = 'VERTICAL';
	chart.itemSpacing = chartSpacing;
	chart.paddingTop = chartPadding.top;
	chart.paddingRight = chartPadding.right;
	chart.paddingBottom = chartPadding.bottom;
	chart.paddingLeft = chartPadding.left;

	// set y to 0 and x to the right of the furthest existing node
	chart.x = figma.currentPage.selection.length > 0 ? figma.currentPage.selection[figma.currentPage.selection.length - 1].x + figma.currentPage.selection[figma.currentPage.selection.length - 1].width + 80 : 0;

	// if showHeader, create an autolayout header frame, full width, with a title in bold + black at 24px and a subtitle in gray at 16px, fill them with lorem ipsum
	if (showHeader) {
		const header = figma.createFrame();
		header.name = 'Header';
		header.layoutMode = 'VERTICAL';
		header.layoutAlign = 'STRETCH';
		header.itemSpacing = headerSpacing;

		const title = figma.createText();
		title.name = 'Title';
		title.characters = 'Lorem ipsum dolor sit amet';
		title.fontSize = titleSize;
		title.fontName = { family: 'Inter', style: 'Bold' };
		title.layoutAlign = 'STRETCH';
		title.fills = black;

		const subtitle = figma.createText();
		subtitle.name = 'Subtitle';
		subtitle.characters = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
		subtitle.fontSize = subtitleSize;
		subtitle.fontName = { family: 'Inter', style: 'Regular' };
		subtitle.layoutAlign = 'STRETCH';
		subtitle.fills = gray;

		header.appendChild(title);
		header.appendChild(subtitle);
		chart.appendChild(header);
	}

	// create a frame for the viz
	const viz = figma.createFrame();
	viz.name = 'Viz';
	viz.layoutMode = 'HORIZONTAL';
	viz.primaryAxisSizingMode = 'FIXED';
	viz.layoutAlign = 'STRETCH';
	viz.primaryAxisAlignItems = 'CENTER';
	viz.counterAxisAlignItems = 'MAX';
	viz.resize(width - chartPadding.right - chartPadding.left, height);
	viz.itemSpacing = 0;
	viz.paddingRight = 24;
	viz.paddingLeft = 24;
	viz.itemReverseZIndex = true;
	viz.clipsContent = false;
	viz.fills = [];

	let columnWidth, maxLabelHeight, maxValueHeight;

	// create a column for each row in the data
	for (let i = 0; i < data.length; i++) {
		const column = figma.createFrame();
		column.name = 'Column';
		column.layoutMode = 'VERTICAL';
		column.layoutAlign = 'STRETCH';
		column.counterAxisAlignItems = 'CENTER';
		column.primaryAxisSizingMode = 'FIXED';
		column.counterAxisSizingMode = 'AUTO';
		column.itemSpacing = columnSpacing;
		column.fills = [];
		column.clipsContent = false;

		columnWidth = Math.min(maxBarWidth, viz.width / data.length);
		column.resize(columnWidth, viz.height);

		let labelHeights = [];
		data.forEach(d => {
			let tempLabel = figma.createText();
			tempLabel.characters = d[bars].toString();
			tempLabel.fontSize = labelSize;
			tempLabel.fontName = { family: 'Inter', style: 'Regular' };
			tempLabel.resize(columnWidth, 40);
			tempLabel.textAutoResize = 'HEIGHT';
			labelHeights.push(tempLabel.height);
			tempLabel.remove();
		});

		let valueHeights = [];
		data.forEach(d => {
			let tempValue = figma.createText();
			tempValue.characters = d[bars].toString();
			tempValue.fontSize = valueSize;
			tempValue.fontName = { family: 'Inter', style: 'Bold' };
			tempValue.resize(columnWidth, 40);
			tempValue.textAutoResize = 'HEIGHT';
			valueHeights.push(tempValue.height);
			tempValue.remove();
		});

		maxLabelHeight = Math.max(...labelHeights);
		maxValueHeight = Math.max(...valueHeights);

		// create a text frame for the label
		const label = figma.createText();
		label.name = 'Label';
		label.characters = data[i][bars];
		label.fontSize = labelSize;
		label.fontName = { family: 'Inter', style: 'Regular' };
		label.fills = black;
		label.textAlignHorizontal = 'CENTER';
		label.textAlignVertical = 'TOP';
		label.textTruncation = "ENDING";
		label.resize(columnWidth, maxLabelHeight);
		label.layoutAlign = 'STRETCH';

		// create a frame to contain the bar and label
		const barContainer = figma.createFrame();
		barContainer.name = 'Bar Container';
		barContainer.layoutMode = 'VERTICAL';
		barContainer.counterAxisAlignItems = 'CENTER';
		barContainer.primaryAxisAlignItems = 'MAX';
		barContainer.layoutAlign = 'STRETCH';
		barContainer.layoutGrow = 1;
		barContainer.primaryAxisSizingMode = 'FIXED';
		barContainer.counterAxisSizingMode = 'AUTO';
		barContainer.fills = [];
		barContainer.clipsContent = false;

		barContainer.itemSpacing = columnSpacing;
		barContainer.paddingRight = barContainerPadding.right;
		barContainer.paddingLeft = barContainerPadding.left;
		barContainer.strokes = black;
		barContainer.strokeBottomWeight = 2;
		barContainer.strokeAlign = 'CENTER';

		// create a frame for the bar within barContainer, width of 32px, fill of blue, height based on the value in the data, where max is equal to the width of barContainer
		const bar = figma.createFrame();
		bar.name = 'Bar';
		bar.layoutMode = 'VERTICAL';
		bar.counterAxisAlignItems = 'CENTER';
		bar.primaryAxisAlignItems = 'MIN';
		bar.itemSpacing = headerSpacing;
		bar.resize(columnWidth - barPadding.left - barPadding.right, (viz.height - columnSpacing - maxValueHeight) * data[i][size] / max);
		bar.layoutAlign = 'STRETCH';
		bar.fills = blue;
		bar.paddingTop = barPadding.top;
		bar.paddingRight = barPadding.right;
		bar.paddingBottom = barPadding.bottom;
		bar.paddingLeft = barPadding.left;

		// create a text frame for the value, if showValue
		if (showValues) {
			const value = figma.createText();
			value.name = 'Value';
			value.characters = data[i][size].toString();
			value.fontSize = valueSize;
			value.fontName = { family: 'Inter', style: 'Bold' };
			value.fills = black;
			value.strokes = white;
			value.strokeWeight = 2;
			value.strokeAlign = 'OUTSIDE';
			value.strokeJoin = 'ROUND';
			value.textAlignHorizontal = 'CENTER';
			value.textAlignVertical = 'CENTER';

			// // if height of bar is less then height of value + 8, append value to bar, else append value to barContainer
			// if (bar.height < value.height + barPadding.top + barPadding.bottom) {
			// 	bar.appendChild(value);
			// 	barContainer.appendChild(bar);
			// } else {
			barContainer.appendChild(value);
			barContainer.appendChild(bar);
			// }
		} else {
			barContainer.appendChild(bar);
		}

		// append barContainer to column
		column.appendChild(barContainer);

		// append label to column
		column.appendChild(label);

		// append column to viz
		viz.appendChild(column);
	}

	// if showYAxis, create a frame for the x axis, full width, with a label in gray at 16px, fill them with lorem ipsum
	if (showYAxis) {
		const tickFrame = figma.createFrame();
		tickFrame.name = 'Ticks';
		tickFrame.layoutMode = 'VERTICAL';
		tickFrame.counterAxisAlignItems = 'MAX';
		tickFrame.primaryAxisAlignItems = "SPACE_BETWEEN"
		// 	// tickFrame.layoutAlign = 'STRETCH';
		tickFrame.primaryAxisSizingMode = 'FIXED'
		tickFrame.counterAxisSizingMode = 'AUTO';
		tickFrame.clipsContent = false;
		tickFrame.fills = [];
		tickFrame.resize(16, viz.height - maxLabelHeight - columnSpacing - (showValues ? maxValueHeight + columnSpacing : 0));

		// create a horizontal autolayout frame for each yTick, with a height of 1
		const reverseTicks = [...ticks].reverse();
		for (let i = 0; i < reverseTicks.length; i++) {
			const tick = figma.createFrame();
			tick.name = 'Tick';
			tick.layoutMode = 'HORIZONTAL';
			tick.itemSpacing = 4;
			tick.primaryAxisAlignItems = 'MAX';
			tick.counterAxisAlignItems = 'CENTER';
			tick.clipsContent = false;
			tick.resize(16, 1);

			// append a line to each tick, 1px stroke in gray, with a width equal to the length of the data * columnWidth
			const line = figma.createLine();
			line.name = 'Line';
			line.resize(data.length * columnWidth, 0);
			line.strokes = gray;
			line.strokeWeight = 1;
			line.strokeAlign = 'CENTER';

			tick.appendChild(line);

			// append a label to each tick, 10px in gray
			const label = figma.createText();
			label.name = 'Label';
			label.characters = reverseTicks[i].toString();
			label.fontSize = 10;
			label.fontName = { family: 'Inter', style: 'Regular' };
			label.fills = gray;
			label.textAlignHorizontal = 'CENTER';

			tick.appendChild(label);
			tickFrame.appendChild(tick);
		}

		const tickFrameContainer = figma.createFrame();
		tickFrameContainer.name = 'Tick Frame Container';
		tickFrameContainer.layoutMode = 'VERTICAL';
		tickFrameContainer.layoutAlign = 'STRETCH';
		tickFrameContainer.primaryAxisSizingMode = 'FIXED'
		tickFrameContainer.counterAxisSizingMode = 'AUTO';
		tickFrameContainer.primaryAxisAlignItems = 'MAX';
		tickFrameContainer.fills = [];
		tickFrameContainer.clipsContent = false;
		tickFrameContainer.paddingBottom = maxLabelHeight + columnSpacing;

		tickFrameContainer.appendChild(tickFrame);
		viz.appendChild(tickFrameContainer);

		const axisLabelFrame = figma.createFrame();
		axisLabelFrame.name = 'Axis Label Container';
		axisLabelFrame.layoutMode = 'HORIZONTAL';
		axisLabelFrame.layoutAlign = 'STRETCH';
		axisLabelFrame.primaryAxisSizingMode = 'AUTO'
		axisLabelFrame.counterAxisSizingMode = 'AUTO';
		axisLabelFrame.primaryAxisAlignItems = 'CENTER';
		axisLabelFrame.counterAxisAlignItems = 'CENTER';
		axisLabelFrame.paddingBottom = leftMargin + columnSpacing;
		axisLabelFrame.fills = [];
		axisLabelFrame.paddingLeft = columnSpacing;

		const axisLabel = figma.createText();
		axisLabel.characters = size;
		axisLabel.fontSize = 12;
		axisLabel.fills = gray;
		axisLabel.fontName = { family: 'Inter', style: 'Regular' };
		axisLabel.rotation = 90;
		axisLabel.textAutoResize = 'WIDTH_AND_HEIGHT';

		axisLabelFrame.appendChild(axisLabel);
		viz.appendChild(axisLabelFrame);
	}

	// append viz to chart
	chart.appendChild(viz);

	figma.currentPage.appendChild(chart);
	nodes.push(chart);

	figma.currentPage.selection = [chart];
	figma.viewport.scrollAndZoomIntoView([chart]);
}

figma.ui.onmessage = async msg => {
	if (msg.type === 'draw') {
		data = msg.data;
		bars = msg.bars;
		size = msg.size;
		width = +msg.width;
		height = +msg.height;
		leftMargin = +msg.leftMargin;
		ticks = msg.ticks;
		showYAxis = msg.showYAxis;
		showHeader = msg.showHeader;
		showValues = msg.showValues;

		await drawChart();
	}

	// Make sure to close the plugin when you're done. Otherwise the plugin will
	// keep running, which shows the cancel button at the bottom of the screen.
	figma.closePlugin();
};
