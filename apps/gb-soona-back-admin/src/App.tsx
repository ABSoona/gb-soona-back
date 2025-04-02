import React, { useEffect, useState } from "react";
import { Admin, DataProvider, Resource } from "react-admin";
import dataProvider from "./data-provider/graphqlDataProvider";
import { theme } from "./theme/theme";
import Login from "./Login";
import "./App.scss";
import Dashboard from "./pages/Dashboard";
import { DemandeList } from "./demande/DemandeList";
import { DemandeCreate } from "./demande/DemandeCreate";
import { DemandeEdit } from "./demande/DemandeEdit";
import { DemandeShow } from "./demande/DemandeShow";
import { jwtAuthProvider } from "./auth-provider/ra-auth-jwt";

const App = (): React.ReactElement => {
  return (
    <div className="App">
      <Admin
        title={"GBSoona-interface"}
        dataProvider={dataProvider}
        authProvider={jwtAuthProvider}
        theme={theme}
        dashboard={Dashboard}
        loginPage={Login}
      >
        <Resource
          name="Demande"
          list={DemandeList}
          edit={DemandeEdit}
          create={DemandeCreate}
          show={DemandeShow}
        />
      </Admin>
    </div>
  );
};

export default App;
