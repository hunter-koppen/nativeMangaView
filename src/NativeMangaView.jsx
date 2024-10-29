import { Component, createElement } from "react";

import { MangaViewer } from "./components/MangaViewer";

export class NativeMangaView extends Component {
    render() {
        return (
            <MangaViewer
                datasource={this.props.datasource}
                datasourceContent={this.props.datasourceContent}
                imageContent={this.props.imageContent}
                imageHeight={this.props.imageHeight}
                imageWidth={this.props.imageWidth}
            />
        );
    }
}
