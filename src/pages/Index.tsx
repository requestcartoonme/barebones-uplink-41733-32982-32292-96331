import DashboardLayout from "@/components/DashboardLayout";
import FileUpload from "@/components/FileUpload";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="p-8">
        <FileUpload />
      </div>
    </DashboardLayout>
  );
};

export default Index;
