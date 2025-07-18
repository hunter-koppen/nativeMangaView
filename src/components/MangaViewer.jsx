import { Component, createElement, createRef } from "react";
import { Dimensions, ScrollView, View } from "react-native";
import PhotoView from "react-native-photo-view-next";
import { Big } from "big.js";

export class MangaViewer extends Component {
    state = {
        window: Dimensions.get("window")
    };
    dimensionListener = null;
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

        if (restoreScrollLocation && scrollPosition.value && this.scrollViewRef?.current) {
            this.scrollViewRef.current.scrollTo({ y: parseInt(scrollPosition.value, 10), animated: false });
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
                nestedScrollEnabled={true}
            >
                <View>{topContent}</View>
                {datasource.items?.map(item => {
                    const uri = imageUri.get(item).value;
                    const width = imageWidth.get(item).value;
                    const height = imageHeight.get(item).value;
                    const newHeight = this.calculateImageHeight(width, height);

                    return (
                        <PhotoView
                            key={item.id}
                            source={{ uri }}
                            minimumZoomScale={1}
                            maximumZoomScale={3}
                            androidScaleType="centerCrop"
                            scaleType="centerCrop"
                            style={{
                                width: window.width,
                                height: newHeight
                            }}
                        />
                    );
                })}
                <View>{bottomContent}</View>
            </ScrollView>
        );
    }
}
