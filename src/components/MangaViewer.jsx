import { Component, createElement, createRef } from "react";
import { Dimensions, ScrollView, View, Image } from "react-native";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { Big } from "big.js";

export class MangaViewer extends Component {
    state = {
        window: Dimensions.get("window"),
        zoomedStates: {},
        isScrollViewReady: false
    };
    dimensionListener = null;
    scrollViewRef = createRef();
    zoomableViewRefs = new Map();
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

    handleDoubleTap = itemId => {
        const { zoomedStates } = this.state;
        const isZoomedIn = zoomedStates[itemId] || false;
        const zoomableViewRef = this.zoomableViewRefs.get(itemId);
        if (zoomableViewRef?.current) {
            if (isZoomedIn) {
                zoomableViewRef.current.zoomTo(1);
            } else {
                zoomableViewRef.current.zoomTo(1.5);
            }
            this.setState(prevState => ({
                zoomedStates: {
                    ...prevState.zoomedStates,
                    [itemId]: !isZoomedIn
                }
            }));
        } else {
            console.error("ZoomableViewRef is not defined or current is null for item:", itemId);
        }
    };

    handleZoomChange = (zoomLevel, itemId) => {
        this.setState(prevState => ({
            zoomedStates: {
                ...prevState.zoomedStates,
                [itemId]: zoomLevel > 1
            }
        }));
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
                {datasource.items?.map(item => {
                    const uri = imageUri.get(item).value;
                    const width = imageWidth.get(item).value;
                    const height = imageHeight.get(item).value;
                    const newHeight = this.calculateImageHeight(width, height);

                    if (!this.zoomableViewRefs.has(item.id)) {
                        this.zoomableViewRefs.set(item.id, createRef());
                    }
                    const zoomableViewRef = this.zoomableViewRefs.get(item.id);

                    return (
                        <ReactNativeZoomableView
                            key={item.id}
                            ref={zoomableViewRef}
                            maxZoom={30}
                            minZoom={1}
                            initialZoom={1}
                            bindToBorders={true}
                            panBoundaryPadding={0}
                            disablePanOnInitialZoom={true}
                            onDoubleTapAfter={() => this.handleDoubleTap(item.id)}
                            onZoomAfter={(event, gestureState, zoomableViewEventObject) =>
                                this.handleZoomChange(zoomableViewEventObject.zoomLevel, item.id)
                            }
                        >
                            <Image
                                source={{ uri }}
                                style={{
                                    width: "100%",
                                    height: newHeight,
                                    resizeMode: "cover"
                                }}
                            />
                        </ReactNativeZoomableView>
                    );
                })}
                <View>{bottomContent}</View>
            </ScrollView>
        );
    }
}
