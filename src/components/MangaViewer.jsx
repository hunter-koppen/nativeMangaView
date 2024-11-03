import { Component, createElement, Fragment } from "react";
import { Dimensions, ScrollView, View } from "react-native";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";

export class MangaViewer extends Component {
    state = {
        windowWidth: Dimensions.get("window").width,
        windowHeight: Dimensions.get("window").height
    };
    dimensionListener = null;

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

    render() {
        if (!this.props.datasource || this.props.datasource.status === "loading") {
            return null;
        }

        return (
            <ReactNativeZoomableView
                maxZoom={30}
                minZoom={1}
                initialZoom={1}
                bindToBorders={true}
                panBoundaryPadding={0}
                contentWidth={this.state.windowWidth}
                contentHeight={this.state.windowHeight}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    style={{ width: "100%", height: this.state.windowHeight }}
                >
                    <View style={{ width: "100%" }}>{this.props.topContent}</View>
                    {this.props.datasource.items?.map((item, index) => {
                        const imageComponent = this.props.imageContent.get(item);

                        return <View style={{ width: "100%" }} key={index}>{imageComponent}</View>;
                    })}
                    <View>{this.props.bottomContent}</View>
                </ScrollView>
            </ReactNativeZoomableView>
        );
    }
}
