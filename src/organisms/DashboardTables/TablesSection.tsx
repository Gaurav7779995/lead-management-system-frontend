import Table from "../../atoms/Table";

const TablesSection = ({ leads, agents }: any) => {
  return (
    <div className="tables">

      <div className="table-box">
        <h3>Recent Leads</h3>
        <table>
          <tbody>
            {leads.map((l: any, i: number) => (
              <tr key={i}>
                <td>{l.name}</td>
                <td>{l.status}</td>
                <td>{l.assigned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-box">
        <h3>Agent Performance</h3>
        <table>
          <tbody>
            {agents.map((a: any, i: number) => (
              <tr key={i}>
                <td>{a.name}</td>
                <td>{a.total}</td>
                <td>{a.converted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default TablesSection;