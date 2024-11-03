import { Component, createElement, createRef } from "react";
import { Dimensions, ScrollView, View, Image } from "react-native";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";

export class MangaViewer extends Component {
    state = {
        windowWidth: Dimensions.get("window").width,
        windowHeight: Dimensions.get("window").height,
        isZoomedIn: false
    };
    dimensionListener = null;
    zoomableViewRef = createRef();

    componentDidMount() {
        this.dimensionListener = Dimensions.addEventListener("change", this.handler);
    }

    componentWillUnmount() {
        if (this.dimensionListener && this.dimensionListener.remove) {
            this.dimensionListener.remove();
        }
    }

    handler = newDimensions => {
        this.setState({
            windowHeight: newDimensions.window.height,
            windowWidth: newDimensions.window.width
        });
    };

    handleDoubleTap = () => {
        const { isZoomedIn } = this.state;
        if (this.zoomableViewRef.current) {
            if (isZoomedIn) {
                this.zoomableViewRef.current.zoomTo(1);
            } else {
                this.zoomableViewRef.current.zoomTo(1.5);
            }
            this.setState({ isZoomedIn: !isZoomedIn });
        }
    };

    handleZoomChange = (zoomLevel) => {
        this.setState({ isZoomedIn: zoomLevel > 1 });
    };

    render() {
        if (!this.props.datasource || this.props.datasource.status === "loading") {
            return null;
        }

        return (
            <ScrollView style={{ width: this.state.windowWidth, height: this.state.windowHeight }}>
                <View>{this.props.topContent}</View>
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
                    {this.props.datasource.items?.map((item, index) => {
                        const imageUri = this.props.imageUri.get(item).value;
                        const imageWidth = this.props.imageWidth.get(item).value;
                        const imageHeight = this.props.imageHeight.get(item).value;
                        const aspectRatio = imageWidth / imageHeight;
                        const newHeight = this.state.windowWidth / aspectRatio

                        return (
                            <Image
                                key={item.id}
                                source={{ uri: imageUri }}
                                style={{
                                    width: "100%",
                                    height: newHeight,
                                    resizeMode: "cover"
                                }}
                            />
                        );
                    })}
                </ReactNativeZoomableView>
                <View>{this.props.bottomContent}</View>
            </ScrollView>
        );
    }
}
