import { Component, createElement, createRef } from "react";
import { Dimensions, ScrollView, View, Image } from "react-native";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { Big } from "big.js";

export class MangaViewer extends Component {
    state = {
        window: Dimensions.get("window"),
        isZoomedIn: false,
        isScrollViewReady: false
    };
    dimensionListener = null;
    zoomableViewRef = createRef();
    scrollViewRef = createRef();
    lastScrollUpdate = Date.now();

    componentDidMount() {
        this.dimensionListener = Dimensions.addEventListener("change", this.handleDimensionChange);
    }

    componentWillUnmount() {
        if (this.dimensionListener && this.dimensionListener.remove) {
            this.dimensionListener.remove();
        } else {
            Dimensions.removeEventListener("change", this.handleDimensionChange);
        }
    }

    handleDimensionChange = newDimensions => {
        this.setState({
            window: newDimensions.window
        });
    };

    handleDoubleTap = () => {
        const { isZoomedIn } = this.state;
        if (this.zoomableViewRef.current) {
            const zoomLevel = isZoomedIn ? 1 : 1.5;
            this.zoomableViewRef.current.zoomTo(zoomLevel);
            this.setState(prevState => ({ isZoomedIn: !prevState.isZoomedIn }));
        }
    };

    handleZoomChange = zoomLevel => {
        this.setState(() => ({ isZoomedIn: zoomLevel > 1 }));
    };

    handleScroll = event => {
        const currentTime = Date.now();
        if (currentTime - this.lastScrollUpdate > 500) {
            this.lastScrollUpdate = currentTime;

            const scrollPosition = Math.round(event.nativeEvent.contentOffset.y);
            if (this.props.scrollPosition) {
                this.props.scrollPosition.setValue(Big(scrollPosition));
            }
        }
    };

    handleScrollViewLayout = () => {
        const { restoreScrollLocation, scrollPosition } = this.props;

        if (
            restoreScrollLocation &&
            !this.state.isScrollViewReady &&
            scrollPosition.value &&
            this.scrollViewRef?.current
        ) {
            this.scrollViewRef.current.scrollTo({ y: parseInt(scrollPosition.value, 10), animated: false });
            this.setState({ isScrollViewReady: true });
        }
    };

    calculateImageHeight = (imageWidth, imageHeight) => {
        const aspectRatio = imageWidth / imageHeight;
        return this.state.window.width / aspectRatio;
    };

    render() {
        const { datasource, imageUri, imageWidth, imageHeight, topContent, bottomContent } = this.props;
        const { window } = this.state;

        if (!datasource || datasource.status === "loading") {
            return null;
        }

        return (
            <ScrollView
                ref={this.scrollViewRef}
                style={{ width: window.width, height: window.height }}
                onScroll={this.handleScroll}
                onLayout={this.handleScrollViewLayout}
                scrollEventThrottle={64}
            >
                <View>{topContent}</View>
                <ReactNativeZoomableView
                    ref={this.zoomableViewRef}
                    maxZoom={30}
                    minZoom={1}
                    initialZoom={1}
                    bindToBorders={true}
                    panBoundaryPadding={0}
                    onDoubleTapAfter={this.handleDoubleTap}
                    onZoomAfter={(event, gestureState, zoomableViewEventObject) =>
                        this.handleZoomChange(zoomableViewEventObject.zoomLevel)
                    }
                >
                    {datasource.items?.map(item => {
                        const uri = imageUri.get(item).value;
                        const width = imageWidth.get(item).value;
                        const height = imageHeight.get(item).value;
                        const newHeight = this.calculateImageHeight(width, height);

                        return (
                            <Image
                                key={item.id}
                                source={{ uri }}
                                style={{
                                    width: "100%",
                                    height: newHeight,
                                    resizeMode: "cover"
                                }}
                            />
                        );
                    })}
                </ReactNativeZoomableView>
                <View>{bottomContent}</View>
            </ScrollView>
        );
    }
}
