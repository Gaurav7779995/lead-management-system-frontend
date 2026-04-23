const ManagerTable = ({ managers }: any) => {
  return (
    <div className="table-box">
      <h3>All Managers</h3>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Team Size</th>
          </tr>
        </thead>

        <tbody>
          {managers.map((m: any, i: number) => (
            <tr key={i}>
              <td>{m.name}</td>
              <td>{m.email}</td>
              <td>{m.team}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManagerTable;