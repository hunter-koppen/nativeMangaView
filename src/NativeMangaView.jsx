import { Component, createElement } from "react";

import { MangaViewer } from "./components/MangaViewer";

export class NativeMangaView extends Component {
    render() {
        return (
            <MangaViewer
                datasource={this.props.datasource}
                datasourceContent={this.props.datasourceContent}
                topContent={this.props.topContent}
                imageUri={this.props.imageUri}
                imageWidth={this.props.imageWidth}
                imageHeight={this.props.imageHeight}
                bottomContent={this.props.bottomContent}
                scrollPosition={this.props.scrollPosition}
                restoreScrollLocation={this.props.restoreScrollLocation.value}
            />
        );
    }
}
