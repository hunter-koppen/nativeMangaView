import { Component, createElement } from "react";
import { View, Dimensions } from "react-native";
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
            return <View />;
        }

        return (
            <View>
                {this.props.datasource.items?.map((item, index) => {
                    const imageComponent = this.props.imageContent.get(item);

                    return (
                        <ReactNativeZoomableView
                            maxZoom={30}
                            minZoom={1}
                            initialZoom={1}
                            bindToBorders={false}
                            contentWidth={this.state.contentWidth}
                            contentHeight={this.state.contentHeight}
                        >
                            {imageComponent}
                        </ReactNativeZoomableView>
                    );
                })}
            </View>
        );
    }
}
