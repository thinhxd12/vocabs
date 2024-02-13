import { Component } from "solid-js";
import "/public/styles/alert.scss";
import { OcAlertfill2, OcCheckcirclefill2 } from "solid-icons/oc";

const Alert: Component<{ message: string; alert: boolean }> = (props) => {
  return (
    <div class="alert">
      {props.alert ? (
        <OcAlertfill2 size={27} color="#ff3a30" class="alertIcon" />
      ) : (
        <OcCheckcirclefill2 size={27} color="#10bb30" class="alertIcon" />
      )}
      <p class="alertMessage">{props.message}</p>
    </div>
  );
};

export default Alert;
