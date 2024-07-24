import React from 'react';
import ForceGraph2D from 'react-force-graph-2d';

class MyViz extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: "MATCH (n) - [:ACTED_IN] -> (m:Movie) RETURN n.name as source, m.title as target",
      data: {
        nodes: [],
        links: []
      }
    };
  }

  componentDidMount() {
    this.reloadData();
  }

  componentWillUnmount() {
    if (this.session) {
      this.session.close();
    }
  }

  reloadData = async () => {
    try {
      if (this.session) {
        this.session.close();
      }

      this.session = this.props.driver.session();

      const result = await this.session.run(this.state.query);

      const nodesMap = new Map();
      const links = [];

      result.records.forEach(record => {
        const source = record.get("source");
        const target = record.get("target");

        if (!nodesMap.has(source)) nodesMap.set(source, { id: source, type: 'Actor' });
        if (!nodesMap.has(target)) nodesMap.set(target, { id: target, type: 'Movie' });

        links.push({ source, target });
      });

      const nodes = Array.from(nodesMap.values());

      this.setState({ data: { nodes, links } });
    } catch (error) {
      console.error("Error fetching data from Neo4j:", error);
    }
  };

  render() {
    return (
      <div style={{ height: '100vh', backgroundColor: 'black' }}>
        <button onClick={this.reloadData} style={{ position: 'absolute', top: '10px', left: '10px', zIndex: '9999' }}>
          Reload
        </button>
        <ForceGraph2D
          graphData={this.state.data}
          nodeId="id"
          nodeCanvasObject={(node, ctx, globalScale) => {
            const size = node.degree ? Math.sqrt(node.degree) * 5 : 5;
            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
            ctx.fillStyle = node.type === 'Movie' ? 'blue' : 'green'; 
            ctx.fill();
            ctx.closePath();
          }}
          linkCanvasObject={(link, ctx, globalScale) => {
            ctx.beginPath();
            ctx.moveTo(link.source.x, link.source.y);
            ctx.lineTo(link.target.x, link.target.y);
            ctx.strokeStyle = link.type === 'ACTED_IN' ? 'yellow' : 'orange'; 
            ctx.stroke();
          }}
          enableNodeDrag={true} 
          enableZoomPanInteraction={true} 
          nodeLabel="id" 
          linkLabel={(link) => `${link.source.id} -> ${link.target.id}`} 
          width={window.innerWidth}
          height={window.innerHeight}
        />
      </div>
    );
  }
}

export default MyViz;
