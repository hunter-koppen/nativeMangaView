import { Component, createElement } from "react";

import { MangaViewer } from "./components/MangaViewer";

export class NativeMangaView extends Component {
    render() {
        return (
            <MangaViewer
                datasource={this.props.datasource}
                datasourceContent={this.props.datasourceContent}
                topContent={this.props.topContent}
                imageContent={this.props.imageContent}
                bottomContent={this.props.bottomContent}
            />
        );
    }
}
